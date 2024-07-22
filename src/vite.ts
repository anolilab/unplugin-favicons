import { createVitePlugin } from "unplugin";

import unpluginFactory from "./core/unplugin-factory";

export default createVitePlugin(unpluginFactory);
export type { FaviconsIconsPluginOptions, FaviconsLogoPluginOptions } from "./types";
