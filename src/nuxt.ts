import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from "@nuxt/kit";
import type { NuxtModule } from "@nuxt/schema";

import type { FaviconsIconsPluginOptions, FaviconsLogoPluginOptions } from "./types";
import vite from "./vite";
import webpack from "./webpack";

type ModuleOptions = FaviconsIconsPluginOptions | FaviconsLogoPluginOptions;

export default defineNuxtModule<ModuleOptions>({
    meta: {
        configKey: "unpluginFavicons",
        name: "nuxt-unplugin-favicons",
    },
    setup(options) {
        addVitePlugin(() => vite(options));
        addWebpackPlugin(() => webpack(options));
    },
}) as NuxtModule<ModuleOptions>;
export type { FaviconsIconsPluginOptions, FaviconsLogoPluginOptions } from "./types";
