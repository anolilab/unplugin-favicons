import { createEsbuildPlugin } from "unplugin";

import unpluginFactory from "./core/unplugin-factory";

export default createEsbuildPlugin(unpluginFactory);
export type { FaviconsIconsPluginOptions, FaviconsLogoPluginOptions } from "./types";
