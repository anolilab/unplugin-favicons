import faviconsPlugin from "@anolilab/unplugin-favicons/rollup";
import html from "@rollup/plugin-html";

export default {
    input: `index.js`,
    output: {
        dir: "dist",
        format: "es",
    },
    plugins: [html(), faviconsPlugin()],
};
