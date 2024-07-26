import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import faviconsPlugin from "@anolilab/unplugin-favicons/vite";

export default defineConfig({
    plugins: [
        sveltekit(),
        faviconsPlugin({
            logo: "./static/favicon.png",
        }),
    ],
});
