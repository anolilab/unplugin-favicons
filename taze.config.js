import { defineConfig } from "taze";

export default defineConfig({
    // ignore packages from bumping
    exclude: [
        "@types/node",
        "eslint",
        "eslint-plugin-vitest",
    ],
    // write to package.json
    write: true,
    ignorePaths: ["node_modules"],
    recursive: true,
    mode: "latest",
});
