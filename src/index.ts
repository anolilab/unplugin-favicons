import { createUnplugin } from "unplugin";

import unpluginFactory from "./core/unplugin-factory";

const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);

export default unplugin;
