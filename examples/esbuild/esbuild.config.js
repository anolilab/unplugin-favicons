import faviconsPlugin from "@anolilab/unplugin-favicons/esbuild";
import { build } from "esbuild";

build({
    bundle: true,
    entryPoints: ["index.js"],
    outdir: "dist",
    packages: "external",
    platform: "node",
    plugins: [faviconsPlugin()],
});
