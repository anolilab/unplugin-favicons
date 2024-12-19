import Module from "node:module";

import type { Compilation as RspackCompilation } from "@rspack/core";
import type HtmlWebpackPlugin from "html-webpack-plugin";
import type { Compilation as WebpackCompilation } from "webpack";

const require = Module.createRequire(import.meta.url);

/** Return the currently used html-webpack-plugin location */
const getHtmlWebpackPluginVersion = (): string => {
    try {
        const location = require.resolve("html-webpack-plugin/package.json");
        // eslint-disable-next-line import/no-dynamic-require,@typescript-eslint/no-unsafe-assignment,security/detect-non-literal-require
        const { version } = require(location);

        return `found html-webpack-plugin ${version} at ${location}`;
    } catch {
        return "html-webpack-plugin not found";
    }
};

const findHtmlWebpackPlugin = (compilation: RspackCompilation | WebpackCompilation): HtmlWebpackPlugin | undefined => {
    const { compiler } = compilation;

    const Plugin = compiler.options.plugins.find((p) => p?.constructor?.name === "HtmlWebpackPlugin")?.constructor;

    if (Plugin === undefined) {
        return undefined;
    }

    if ((Plugin as unknown as HtmlWebpackPlugin).version >= 5) {
        return Plugin as unknown as HtmlWebpackPlugin;
    }

    compilation.errors.push(
        new compiler.webpack.WebpackError(
            `${
                "This @anolilab/unplugin-favicons version is not compatible with your current HtmlWebpackPlugin version.\n" +
                "Please upgrade to HtmlWebpackPlugin >= 5\n"
            }${getHtmlWebpackPluginVersion()}`,
        ) as any,
    );

    return undefined;
};

export default findHtmlWebpackPlugin;
