import FaviconsPlugin from "@anolilab/unplugin-favicons/rspack";

export default {
    builtins: {
        html: [{ template: "./index.html" }],
    },
    entry: {
        main: "./index.js",
    },
    plugins: [FaviconsPlugin()],
};
