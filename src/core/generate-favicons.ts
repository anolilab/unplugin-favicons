import { readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

import { colorize } from "consola/utils";
import stringify from "fast-json-stable-stringify";
import type { FaviconFile, FaviconHtmlElement, FaviconImage, FaviconOptions, FaviconResponse } from "favicons";
import { favicons } from "favicons";
import type { ReadonlyDeep } from "type-fest";

import type { FaviconsIconsPluginOptions, FaviconsLogoPluginOptions, JobConfig } from "../types";
import { DEFAULT_FAVICONS_OPTIONS, DEFAULT_ICON_OPTIONS } from "./const";
import { computeKey as cacheComputeKey, get as cacheGet, put as cachePut } from "./utils/cache";
import consola from "./utils/consola";

/**
 * @private
 *
 * Provided a JobConfig object, returns a cache key computed using any
 * configuration options for the job and a hash of the source file's contents.
 */
const generateCacheKeyForJob = async (jobConfig: JobConfig) =>
    // Generate a cache key for the current icon any its configuration, but modify
    // the 'source' property of the job configuration to contain a hash of the
    // source file's contents rather than its name.
    cacheComputeKey(
        stringify({
            ...jobConfig,
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            source: readFileSync(jobConfig.source, { encoding: "utf8" }),
        }),
    );
/**
 * @private
 *
 * Provided a `FaviconsPluginOptions` object, returns an array of
 * [source, FaviconOptions] tuples, each representing a distinct `favicons` job
 * to run.
 */
const mapOptionsToJobs = (options: FaviconsIconsPluginOptions): JobConfig[] => {
    const { icons: notUsed, ...others } = (options.favicons ?? {}) as FaviconOptions;

    // eslint-disable-next-line unicorn/no-array-reduce
    return Object.entries(options.icons).reduce<JobConfig[]>((jobs, [iconType, sourceAndIconOptions]) => {
        const { source, ...iconOptions } = sourceAndIconOptions;

        // Create a new 'icons' configuration key that contains only the current
        // icon type.
        const icons = { ...DEFAULT_ICON_OPTIONS, [iconType]: iconOptions };
        const config: ReadonlyDeep<FaviconOptions> = { ...others, icons };
        const job = { config, iconType, source } as JobConfig;

        return [...jobs, job];
    }, []);
};

/**
 * @private
 *
 * Provided an array of `FaviconResponse` objects from each job, merges them
 * into a single `FaviconResponse` object.
 */
const reduceResponses = (responses: FaviconResponse[]) =>
    // eslint-disable-next-line unicorn/no-array-reduce
    responses.reduce<FaviconResponse>(
        (response, currentResponse) => {
            currentResponse.files.forEach((file) => {
                response.files.push(file);
            });

            currentResponse.images.forEach((image) => {
                response.images.push(image);
            });

            currentResponse.html.forEach((html) => {
                response.html.push(html);
            });

            return response;
        },
        {
            files: [],
            html: [],
            images: [],
        },
    );

/**
 * @private
 *
 * Caches the provided `FaviconResponse` using the provided cache key.
 *
 * Note: Because `cacache` only allows for the serialization of strings and
 * Buffers, we have to manually separate binary data from the rest of the
 * response.
 */
const cacheResponse = async (cacheKey: string, response: FaviconResponse, label?: string): Promise<void> => {
    const serializableResponse = {
        files: [] as Omit<Partial<FaviconFile>, "contents">[],
        html: [] as FaviconHtmlElement[],
        images: [] as Omit<FaviconImage, "contents">[],
    };

    // Write images to cache as individual entities and add all other metadata to
    // the new response.
    // eslint-disable-next-line compat/compat
    const imagesPromise = Promise.all(
        response.images.map(async (image) => {
            const { contents, ...meta } = image;
            const key = `${cacheKey}/images/${meta.name}`;

            serializableResponse.images.push(meta);

            consola.verbose(`${label ?? ""} Caching ${colorize("green", meta.name)}.`);

            await cachePut(key, contents, { logLabel: meta.name });
        }),
    );

    // Write files to cache as individual entities and add all other metadata to
    // the new response.
    // eslint-disable-next-line compat/compat
    const filesPromise = Promise.all(
        response.files.map(async (file) => {
            const { contents, ...meta } = file;
            const key = `${cacheKey}/files/${meta.name}`;

            serializableResponse.files.push(meta);

            consola.verbose(`${label ?? ""} Caching ${colorize("green", meta.name)}.`);

            await cachePut(key, contents, { logLabel: meta.name });
        }),
    );

    // Add all HTML to the new response.
    response.html.forEach((html) => {
        serializableResponse.html.push(html);
    });

    // Serialize response and write it to cache.
    const serializedResponse = JSON.stringify(serializableResponse);
    const responsePromise = cachePut(cacheKey, serializedResponse, { logLabel: label ?? "" });

    // eslint-disable-next-line compat/compat
    await Promise.all([filesPromise, imagesPromise, responsePromise]);
};

/**
 * @private
 *
 * Provided an iconType and source asset path, returns a cached FaviconResponse
 * object if one exists.
 *
 * Note: Because `cacache` only allows for the serialization of strings and
 * Buffers, we have to manually merge binary data into a single response.
 */
const getCachedResponse = async (cacheKey: string, label?: string): Promise<object | undefined> => {
    const serializedResponse = await cacheGet(cacheKey, { logLabel: label ?? "" });

    if (!serializedResponse) {
        return undefined;
    }

    const response: FaviconResponse = JSON.parse(serializedResponse.toString("utf8")) as FaviconResponse;

    // Read all images from cache.
    // eslint-disable-next-line compat/compat
    const imagesPromise = Promise.all(
        response.images.map(async (image) => {
            const key = `${cacheKey}/images/${image.name}`;
            const contents = await cacheGet(key, { logLabel: image.name });

            if (!contents) {
                throw new Error(`Expected cached contents for "${key}"`);
            }

            return { ...image, contents };
        }),
    );

    // Read all files from cache.
    // eslint-disable-next-line compat/compat
    const filesPromise = Promise.all(
        response.files.map(async (file) => {
            const key = `${cacheKey}/files/${file.name}`;
            const contents = await cacheGet(key, { logLabel: file.name });

            if (!contents) {
                throw new Error(`Expected cached contents for "${key}"`);
            }

            return { ...file, contents: contents.toString("utf8") };
        }),
    );

    // Wait for all assets to be read from cache.
    // eslint-disable-next-line compat/compat
    const [files, images] = await Promise.all([filesPromise, imagesPromise]);

    return {
        ...response,
        files,
        images,
    };
};

/**
 * Provided a FaviconsPluginOptions object, generates assets and returns a
 * FaviconResponse object.
 */
const generateFavicons = async (options: FaviconsIconsPluginOptions | FaviconsLogoPluginOptions): Promise<FaviconResponse> => {
    // Because favicons only allows a single source asset per invocation, map
    // incoming configuration into a list of jobs we will need to run.
    const jobConfigs: JobConfig[] = [];

    if ((options as FaviconsIconsPluginOptions).icons) {
        jobConfigs.push(...mapOptionsToJobs(options as FaviconsIconsPluginOptions));
    } else {
        const config: ReadonlyDeep<FaviconOptions> = {
            ...DEFAULT_FAVICONS_OPTIONS,
            ...(options as FaviconsLogoPluginOptions).favicons,
            icons: {
                ...DEFAULT_FAVICONS_OPTIONS.icons,
                ...(options as FaviconsLogoPluginOptions).favicons?.icons,
            },
        };

        // eslint-disable-next-line no-param-reassign
        (options as FaviconsLogoPluginOptions).logo = resolve((options as FaviconsLogoPluginOptions).logo ?? join("assets", "logo.png"));

        jobConfigs.push({ config, iconType: "logo", source: (options as FaviconsLogoPluginOptions).logo } as JobConfig);
    }

    const jobs = jobConfigs.map(async (jobConfig) => {
        const { config, iconType, source } = jobConfig;
        // N.B. Favicons modifies the `config` object in-place, so we need to
        // generate a key now to ensure that our cache get/put functions use the
        // same one.
        const cacheKeyForJob = await generateCacheKeyForJob(jobConfig);

        const sourceFileName = basename(source);

        if (options.cache) {
            // If we have a cached response for this source asset, return it.
            const cachedResponse = await getCachedResponse(cacheKeyForJob, iconType);

            if (cachedResponse) {
                consola.verbose(`Using cached ${colorize("bold", iconType)} assets from source ${colorize("green", sourceFileName)}.`);

                return cachedResponse;
            }
        }

        const response = await favicons(source, config as FaviconOptions);

        if (options.cache) {
            // Return the response immediately without awaiting the cache write.
            // eslint-disable-next-line no-void,promise/always-return
            void cacheResponse(cacheKeyForJob, response, iconType).then(() => {
                consola.verbose(`Cached rendered ${colorize("bold", iconType)} assets from source ${colorize("green", sourceFileName)}.`);
            });
        }

        return response;
    });

    // Merge each response into a single `FaviconsResponse`.
    // eslint-disable-next-line compat/compat
    return reduceResponses((await Promise.all(jobs)) as FaviconResponse[]);
};

export default generateFavicons;
