import react from "@vitejs/plugin-react";
import vike from "vike/plugin";

import faviconsPlugin from "@anolilab/unplugin-favicons/vite";

export default {
    plugins: [
        react(),
        vike(),
        faviconsPlugin(),
    ],
};
