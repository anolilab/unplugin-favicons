import FaviconsPlugin from "@anolilab/unplugin-favicons/rspack";
import HtmlRspackPlugin from "@rspack/plugin-html";

export default {
    entry: {
        main: "./index.js",
    },
    plugins: [
        new HtmlRspackPlugin.default({
            filename: "index.html",
            template: "./index.html",
        }),
        FaviconsPlugin(),
    ],
};
