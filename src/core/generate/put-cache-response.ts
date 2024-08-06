import { colorize } from "consola/utils";
import type { FaviconFile, FaviconHtmlElement, FaviconImage, FaviconResponse } from "favicons";

import { put as cachePut } from "../utils/cache";
import consola from "../utils/consola";

/**
 * @private
 *
 * Caches the provided `FaviconResponse` using the provided cache key.
 *
 * Note: Because `cacache` only allows for the serialization of strings and
 * Buffers, we have to manually separate binary data from the rest of the
 * response.
 */
const putCacheResponse = async (cacheKey: string, response: FaviconResponse, label?: string): Promise<void> => {
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

export default putCacheResponse;
