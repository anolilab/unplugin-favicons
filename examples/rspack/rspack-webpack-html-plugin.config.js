import FaviconsPlugin from "@anolilab/unplugin-favicons/rspack";
import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
    entry: {
        main: "./index.js",
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "./index.html",
        }),
        FaviconsPlugin(),
    ],
};
