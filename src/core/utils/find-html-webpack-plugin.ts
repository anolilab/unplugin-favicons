import Module from "node:module";

import type { Compilation as RspackCompilation } from "@rspack/core";
import type HtmlWebpackPlugin from "html-webpack-plugin";
import type { Compilation as WebpackCompilation } from "webpack";

const require = Module.createRequire(import.meta.url);

const INCOMPATIBLE_VERSION_MESSAGE = `This @anolilab/unplugin-favicons version is not compatible with your current HtmlWebpackPlugin version.
Please upgrade to HtmlWebpackPlugin >= 5`;

/** Return the currently used html-webpack-plugin location. */
const getHtmlWebpackPluginVersion = (): string => {
    try {
        const location = require.resolve("html-webpack-plugin/package.json");
        // eslint-disable-next-line import/no-dynamic-require,@typescript-eslint/no-unsafe-assignment
        const { version } = require(location);

        return `found html-webpack-plugin ${String(version)} at ${location}`;
    } catch {
        return "html-webpack-plugin not found";
    }
};

const findHtmlWebpackPlugin = (compilation: RspackCompilation | WebpackCompilation): HtmlWebpackPlugin | undefined => {
    const { compiler } = compilation;

    // `plugins` entries can be null/undefined at runtime, despite the type.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const Plugin = compiler.options.plugins.find((p) => p?.constructor?.name === "HtmlWebpackPlugin")?.constructor;

    if (Plugin === undefined) {
        return undefined;
    }

    if ((Plugin as unknown as HtmlWebpackPlugin).version >= 5) {
        return Plugin as unknown as HtmlWebpackPlugin;
    }

    compilation.errors.push(new compiler.webpack.WebpackError(`${INCOMPATIBLE_VERSION_MESSAGE}\n${getHtmlWebpackPluginVersion()}`));

    return undefined;
};

export default findHtmlWebpackPlugin;
