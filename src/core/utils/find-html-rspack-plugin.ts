import type { Compilation as RspackCompilation } from "@rspack/core";
import type HtmlRspackPlugin from "@rspack/plugin-html";

const findHtmlRspackPlugin = (compilation: RspackCompilation): HtmlRspackPlugin | undefined => {
    const {
        compiler: { options },
    } = compilation;

    // `plugins` entries can be null/undefined at runtime, despite the type.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const Plugin = options.plugins.find((p) => p?.constructor?.name === "HtmlRspackPlugin")?.constructor;

    if (Plugin === undefined) {
        return undefined;
    }

    return Plugin as unknown as HtmlRspackPlugin;
};

export default findHtmlRspackPlugin;
