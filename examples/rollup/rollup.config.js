import faviconsPlugin from "@anolilab/unplugin-favicons/rollup";

export default {
    input: `index.js`,
    output: {
        dir: "dist-assets",
        format: "es",
    },
    plugins: [faviconsPlugin()],
};
