import { createEsbuildPlugin } from "unplugin";

import unpluginFactory from "./core/unplugin-factory";

export default createEsbuildPlugin(unpluginFactory);
