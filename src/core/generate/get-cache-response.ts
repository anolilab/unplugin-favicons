import type { FaviconResponse } from "favicons";

import { get as cacheGet } from "../utils/cache";

/**
 * @private
 *
 * Provided an iconType and source asset path, returns a cached FaviconResponse
 * object if one exists.
 *
 * Note: Because `cacache` only allows for the serialization of strings and
 * Buffers, we have to manually merge binary data into a single response.
 */
const getCacheResponse = async (cacheKey: string, label?: string): Promise<FaviconResponse | undefined> => {
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

export default getCacheResponse;
