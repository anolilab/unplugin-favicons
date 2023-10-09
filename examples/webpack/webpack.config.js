import { resolve } from "node:path";

import faviconsPlugin from "@anolilab/unplugin-favicons/webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

const config = {
    entry: "./index.js",
    output: {
        path: resolve("./dist"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "./index.html",
        }),
        faviconsPlugin({
            outputPath: "favicons",
        }),
    ],
};

export default config;
