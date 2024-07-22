import { createRspackPlugin } from "unplugin";

import unpluginFactory from "./core/unplugin-factory";

export default createRspackPlugin(unpluginFactory);
export type { FaviconsIconsPluginOptions, FaviconsLogoPluginOptions } from "./types";
