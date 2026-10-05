import { readFileSync } from "node:fs";

import stringify from "fast-json-stable-stringify";

import type { JobConfig } from "../../types";
import { computeKey as cacheComputeKey } from "../utils/cache";

/**
 * Provided a JobConfig object, returns a cache key computed using any
 * configuration options for the job and a hash of the source file's contents.
 */
// Async is part of the contract: callers await a Promise<string>.
// eslint-disable-next-line @typescript-eslint/require-await
const generateCacheKeyForJob = async (jobConfig: JobConfig): Promise<string> =>
    // Generate a cache key for the current icon any its configuration, but modify
    // the 'source' property of the job configuration to contain a hash of the
    // source file's contents rather than its name.
    cacheComputeKey(
        stringify({
            ...jobConfig,
            source: readFileSync(jobConfig.source, { encoding: "utf8" }),
        }),
    );

export default generateCacheKeyForJob;
