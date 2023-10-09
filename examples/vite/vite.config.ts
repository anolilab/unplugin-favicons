import { loadEnv, defineConfig } from "vite";

import faviconsPlugin from "@anolilab/unplugin-favicons/vite";

export default defineConfig(({ mode }) => {
    Object.assign(process.env, loadEnv(mode, process.cwd()));

    return {
        plugins: [faviconsPlugin()],
    };
});
