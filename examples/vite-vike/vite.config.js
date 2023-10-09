import react from "@vitejs/plugin-react";
import ssr from "vike/plugin";

import faviconsPlugin from "@anolilab/unplugin-favicons/vite";
export default {
    plugins: [
        react(),
        faviconsPlugin(),
        ssr({
            prerender: {
                noExtraDir: true,
                parallel: 1, // Can be `number` or `boolean`
                partial: false,
            },
        }),
    ],
};
