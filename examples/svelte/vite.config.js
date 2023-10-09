import { defineConfig } from "vite";
import faviconsPlugin from "@anolilab/unplugin-favicons/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
    plugins: [svelte(), faviconsPlugin()],
});
