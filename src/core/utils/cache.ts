import { get as cacheGet, put as cachePut } from "cacache";
import { colorize } from "consola/utils";
import findCacheDir from "find-cache-dir";
import { fromData } from "ssri";

import { PLUGIN_NAME } from "../const";
import consola from "./consola";

/**
 * Cache subdirectory in node_modules/.cache.
 */
const cachePath = findCacheDir({ name: PLUGIN_NAME });

type SsriData = Buffer | DataView | NodeJS.TypedArray | string;

interface CacheOptions {
    logLabel?: string;
}

/**
 * Returns the SHA-256 hash of the provided value.
 */
export const computeKey = (data: SsriData): string => {
    const integrity = fromData(data);

    return integrity.toString();
};

/**
 * Intended use: pass in raw file contents as key.
 * Use integrity SHA as internal key.
 * Return value if exists.
 */
export const get = async (key: SsriData, { logLabel }: CacheOptions): Promise<Buffer | undefined> => {
    if (!cachePath) {
        throw new Error("Unable to find a suitable cache directory.");
    }

    const hashKey = computeKey(key);
    const fullLogLabel = `cache:get${logLabel ? `:${logLabel}` : ""}`;

    if (logLabel) {
        consola.debug(`${fullLogLabel} Generated digest for ${colorize("green", logLabel)}:`, hashKey);
    }

    try {
        const result = await cacheGet(cachePath, hashKey);
        const { data: cachedData } = result;

        if (logLabel) {
            consola.debug(`${fullLogLabel} Cache hit for ${logLabel}`);
        }

        return cachedData;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (logLabel) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (String(error?.message).includes("No cache entry")) {
                consola.debug(`${fullLogLabel} ${colorize("yellow", "Cache miss.")}`);
            } else {
                consola.error(`${fullLogLabel} ${error}`);
            }
        }

        return undefined;
    }
};

/**
 * Pass in source file contents as key. Get FaviconsResponse as value.
 * Internally use sha integrity to compute key.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
export const put = async (key: SsriData, data: any, { logLabel }: CacheOptions): Promise<void> => {
    if (!cachePath) {
        throw new Error("Unable to find a suitable cache directory.");
    }

    const hashKey = computeKey(key);

    await cachePut(cachePath, hashKey, data);

    if (logLabel) {
        const fullLogLabel = `cache:put:${logLabel}`;

        consola.debug(`${fullLogLabel} ${colorize("green", "Put OK.")}`);
    }
};
