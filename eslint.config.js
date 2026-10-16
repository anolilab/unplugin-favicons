import { createConfig } from "@anolilab/eslint-config";

/** @type {import("@anolilab/eslint-config").PromiseFlatConfigComposer} */
const config = await createConfig({
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
        // Owned by other tools: reformatting these breaks pnpm's own parser,
        // and audit-ci.jsonc is a list of GHSA advisory ids, not secrets.
        "pnpm-workspace.yaml",
        "codecov.yml",
        "audit-ci.jsonc",
    ],
});

export default [
    ...config,
    {
        // `@typescript-eslint`'s `unbound-method` rule (re-exported as
        // `vitest/unbound-method`) crashes under TypeScript 6 with "Cannot read
        // properties of undefined (reading 'flatMap')" while walking destructured
        // `vi.hoisted()`/mock members (@typescript-eslint 8.x does not support TS 6).
        // Disable it until that combination is supported again.
        rules: {
            "vitest/unbound-method": "off",
        },
    },
];
