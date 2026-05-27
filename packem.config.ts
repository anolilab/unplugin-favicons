import { defineConfig } from "@visulima/packem/config";
import transformer from "@visulima/packem/transformer/esbuild";

export default defineConfig({
    externals: ["type-fest", "tagged-tag"],
    rollup: {
        license: {
            path: "./LICENSE.md",
        },
    },
    transformer,
});
