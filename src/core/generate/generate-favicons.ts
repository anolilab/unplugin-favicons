import { basename, join, resolve } from "node:path";

import { colorize } from "consola/utils";
import type { FaviconOptions, FaviconResponse } from "favicons";
import { favicons } from "favicons";
import type { ReadonlyDeep } from "type-fest";

import type { FaviconsIconsPluginOptions, FaviconsLogoPluginOptions, JobConfig } from "../../types";
import { DEFAULT_FAVICONS_OPTIONS, DEFAULT_ICON_OPTIONS } from "../const";
import consola from "../utils/consola";
import generateCacheKeyForJob from "./generate-cache-key-for-job";
import getCacheResponse from "./get-cache-response";
import putCacheResponse from "./put-cache-response";

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
 * Provided a FaviconsPluginOptions object, generates assets and returns a
 * FaviconResponse object.
 */
const generateFavicons = async (options: FaviconsIconsPluginOptions | FaviconsLogoPluginOptions): Promise<FaviconResponse> => {
    // Because favicons only allows a single source asset per invocation, map
    // incoming configuration into a list of jobs we will need to run.
    const jobConfigs: JobConfig[] = [];

    if ((options as FaviconsIconsPluginOptions).icons && !(options as FaviconsLogoPluginOptions).logo) {
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
        // N.B. Favicons modifies the `config` object in-place, so we need to
        // generate a key now to ensure that our cache get/put functions use the
        // same one.
        const cacheKeyForJob = await generateCacheKeyForJob(jobConfig);

        const { config, iconType, source } = jobConfig;
        const sourceFileName = basename(source);

        if (options.cache) {
            // If we have a cached response for this source asset, return it.
            const cachedResponse = await getCacheResponse(cacheKeyForJob, iconType);

            if (cachedResponse) {
                consola.verbose(`Using cached ${colorize("bold", iconType)} assets from source ${colorize("green", sourceFileName)}.`);

                return cachedResponse;
            }
        }

        const response = await favicons(source, config as FaviconOptions);

        if (options.cache) {
            // Return the response immediately without awaiting the cache write.
            // eslint-disable-next-line no-void,promise/always-return
            void putCacheResponse(cacheKeyForJob, response, iconType).then(() => {
                consola.verbose(`Cached rendered ${colorize("bold", iconType)} assets from source ${colorize("green", sourceFileName)}.`);
            });
        }

        return response;
    });

    // Merge each response into a single `FaviconsResponse`.
    // eslint-disable-next-line compat/compat
    return reduceResponses(await Promise.all(jobs));
};

export default generateFavicons;
