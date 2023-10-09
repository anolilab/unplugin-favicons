import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from "@nuxt/kit";
import type { NuxtModule } from "@nuxt/schema";

import type { FaviconsIconsPluginOptions, FaviconsLogoPluginOptions } from "./types.d";
import vite from "./vite";
import webpack from "./webpack";

type ModuleOptions = FaviconsIconsPluginOptions | FaviconsLogoPluginOptions;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export default defineNuxtModule<ModuleOptions>({
    meta: {
        configKey: "openapi-jsdoc-compiler",
        name: "nuxt-openapi-jsdoc-compiler",
    },
    setup(options) {
        addVitePlugin(() => vite(options));
        addWebpackPlugin(() => webpack(options));
    },
}) as NuxtModule<ModuleOptions>;
