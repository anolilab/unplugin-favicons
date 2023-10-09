import type { NormalizedPackageJson, NormalizeOptions } from "read-pkg";
// eslint-disable-next-line import/no-extraneous-dependencies
import { readPackageSync } from "read-pkg";
import type { Options } from "tsup";
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig as baseDefineConfig } from "tsup";

const getPackageSources = (packageContent: NormalizedPackageJson): string[] => {
    if (typeof packageContent["source"] === "string") {
        return [packageContent["source"]];
    }

    if (Array.isArray(packageContent["sources"])) {
        return packageContent["sources"] as string[];
    }

    throw new TypeError("Please define a source or sources key in the package.json.");
};

// eslint-disable-next-line import/no-unused-modules
export default baseDefineConfig((options: Options) => {
    const packageJsonContent = readPackageSync(options as NormalizeOptions);

    const sources = getPackageSources(packageJsonContent);
    const peerDependenciesKeys = Object.keys(packageJsonContent.peerDependencies ?? {});

    return {
        ...options,
        clean: true,
        declaration: true,
        dts: true,
        entry: sources,
        env: {
            NODE_ENV: process.env["NODE_ENV"] as string,
        },
        // react external https://github.com/vercel/turborepo/issues/360#issuecomment-1013885148
        external: [...new Set([...peerDependenciesKeys, ...Object.keys(packageJsonContent.optionalDependencies ?? {})])],
        format: "esm",
        incremental: !options.watch,
        minify: process.env["NODE_ENV"] === "production",
        silent: !options.watch,
        sourcemap: true,
        splitting: true,
        treeshake: true,
    };
});
