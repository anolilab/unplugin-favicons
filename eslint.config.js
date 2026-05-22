import { createConfig } from "@anolilab/eslint-config";

/** @type {import("@anolilab/eslint-config").PromiseFlatConfigComposer} */
export default createConfig({
    ignores: [
        "dist",
        "node_modules",
        "coverage",
        "__fixtures__",
        "examples",
        "vitest.config.ts",
        "packem.config.ts",
        ".secretlintrc.cjs",
        "commitlint.config.cjs",
        ".prettierrc.cjs",
        "package.json",
        "verify-node-version.cjs",
        "taze.config.js",
        ".lintstagedrc.js",
        "README.md",
        ".github",
    ],
});
