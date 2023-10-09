import { join } from "node:path";

import type { Compilation as RspackCompilation } from "@rspack/core";
import { colorize } from "consola/utils";
import type { FaviconResponse } from "favicons";
import type { OutputAsset, OutputChunk } from "rollup";
import type { UnpluginBuildContext, UnpluginFactory } from "unplugin";
import type { Compilation as WebpackCompilation } from "webpack";

import type { EmittedFile, FaviconsIconsPluginOptions, FaviconsLogoPluginOptions, HtmlTagDescriptor } from "../types.d";
import { PLUGIN_NAME } from "./const";
import generateFavicons from "./generate-favicons";
import parseHtml from "./parse-html";
import updateManifest from "./update-manifest";
import consola from "./utils/consola";
import findHtmlRspackPlugin from "./utils/find-html-rspack-plugin";
import findHtmlWebpackPlugin from "./utils/find-html-webpack-plugin";
import formatDuration from "./utils/format-duration";
import Oracle from "./utils/oracle";

// eslint-disable-next-line sonarjs/cognitive-complexity
const unpluginFactory: UnpluginFactory<FaviconsIconsPluginOptions | FaviconsLogoPluginOptions | undefined, false> = (options, meta) => {
    const config = { cache: true, inject: true, ...options } as FaviconsIconsPluginOptions | FaviconsLogoPluginOptions;
    const oracle = new Oracle(config?.projectRoot);
    const developer = oracle.guessDeveloper();

    config.favicons = {
        appDescription: oracle.guessDescription(),
        appName: oracle.guessAppName(),
        developerName: developer.name,
        developerURL: developer.url,
        version: oracle.guessVersion(),
        ...(config as FaviconsLogoPluginOptions).favicons,
    };

    let base = "";
    let frontendFramework: "astro" | "sveltekit" | undefined;
    let parsedHtml: HtmlTagDescriptor[] = [];

    // eslint-disable-next-line unicorn/no-negated-condition
    let injectionStatus: "DISABLED" | "ENABLED" | "NOT_SUPPORTED" = config.inject ? "ENABLED" : !config.inject ? "DISABLED" : "ENABLED";

    if (meta.framework === "esbuild") {
        base = "/";

        consola.warn(`html injection in esbuild is not supported, injection was disabled.`);
        injectionStatus = "NOT_SUPPORTED";
    }

    /**
     * Called during the `generateBundle` phase to add assets to the compilation
     * and update the HTML returned by favicons for injection later.
     */
    const emitFiles = (context: UnpluginBuildContext, response: FaviconResponse) => {
        const { files, html, images } = response;

        // Map each image returned from `favicons` into an object containing its
        // original name and the resolved name (ie: name it will have in the output
        // bundle). Additionally, emit the image into the Vite context.
        const emittedImages = images.map<EmittedFile>((faviconImage) => {
            const filePath = join(config.outputPath ?? "", faviconImage.name);

            context.emitFile({
                fileName: filePath,
                source: faviconImage.contents,
                type: "asset",
            });

            consola.debug(`emit ${colorize("green", String(filePath))}`);

            return { name: faviconImage.name, resolvedName: filePath } as EmittedFile;
        });

        // Map each file returned from `favicons` into an object containing its
        // original name and the resolved name (ie: name it will have in the output
        // bundle). Additionally, emit the file into the Vite context.
        const emittedFiles = files.map<EmittedFile>((faviconFile) => {
            const filePath = join(config.outputPath ?? "", faviconFile.name);

            // If the file from favicons is a manifest, we need to update its file
            // names to those emitted by Vite rather than the original asset names.
            // For all other files, we keep the original contents.
            const source = faviconFile.name.includes("manifest") ? updateManifest(emittedImages, faviconFile.contents) : faviconFile.contents;

            context.emitFile({
                fileName: filePath,
                source,
                type: "asset",
            });

            consola.debug(`emit ${colorize("green", filePath)}`);

            return { name: faviconFile.name, resolvedName: filePath } as EmittedFile;
        });

        // Transform paths in emitted HTML tags using the filenames generated by
        // Vite.
        parsedHtml = parseHtml([...emittedFiles, ...emittedImages], html, base);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const injectHtmlPlugin = (compilation: RspackCompilation | WebpackCompilation, plugin: any) => {
        if (plugin) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            plugin.getHooks(compilation)?.alterAssetTags?.tapPromise(
                PLUGIN_NAME,
                async (htmlPluginData: {
                    assetTags: {
                        meta: {
                            attributes: Record<string, boolean | string | undefined> | undefined;
                            meta: { plugin: string };
                            tagName: string;
                            voidTag: boolean;
                        }[];
                    };
                    plugin: { userOptions: { favicon: boolean; favicons: boolean } };
                }) => {
                    // Skip if a custom injectFunction returns false or if
                    // the htmlWebpackPlugin options includes a `favicons: false` flag
                    const isInjectionAllowed = htmlPluginData.plugin.userOptions.favicon !== false && htmlPluginData.plugin.userOptions.favicons !== false;

                    if (!isInjectionAllowed) {
                        return htmlPluginData;
                    }

                    htmlPluginData.assetTags.meta.push(
                        ...parsedHtml.map((tag) => {
                            return {
                                attributes: tag.attrs,
                                meta: { plugin: PLUGIN_NAME },
                                tagName: tag.tag,
                                voidTag: true,
                            };
                        }),
                    );

                    return htmlPluginData;
                },
            );
        }
    };

    return {
        apply: "build",
        async buildStart(this: UnpluginBuildContext) {
            const startTime = Date.now();

            const response = await generateFavicons(config);

            consola.info(`Generated assets in ${formatDuration(Date.now() - startTime)}.`);

            emitFiles(this, response);

            if (injectionStatus === "DISABLED") {
                consola.info("Inject is disabled, a webapp html file will be generated.");

                this.emitFile({
                    fileName: "webapp.html",
                    source: parsedHtml.map((tag) => tag.fragment).join("\n"),
                    type: "asset",
                });
            }
        },
        enforce: "post",
        name: PLUGIN_NAME,
        rollup: {
            generateBundle(_, bundle) {
                if (injectionStatus === "ENABLED" && bundle["index.html"] && typeof (bundle["index.html"] as OutputAsset)["source"] === "string") {
                    // eslint-disable-next-line no-param-reassign
                    (bundle["index.html"] as OutputAsset)["source"] = ((bundle["index.html"] as OutputAsset)["source"] as string).replace(
                        "</head>",
                        `${parsedHtml.map((tag) => tag.fragment).join("\n")}\n</head>`,
                    );
                }
            },
        },
        rspack(compiler) {
            base = "/";

            compiler.hooks.make.tapPromise(PLUGIN_NAME, async (compilation) => {
                if (injectionStatus === "ENABLED") {
                    const rspackPlugin = findHtmlRspackPlugin(compilation);
                    const htmlWebpackPlugin = findHtmlWebpackPlugin(compilation);

                    if (rspackPlugin) {
                        // Hook into the html-webpack-plugin processing and add the html
                        injectHtmlPlugin(compilation, rspackPlugin);
                    } else if (htmlWebpackPlugin) {
                        // Hook into the html-webpack-plugin processing and add the html
                        injectHtmlPlugin(compilation, htmlWebpackPlugin);
                    } else {
                        consola.warn(
                            `No "@rspack/plugin-html" or "html-webpack-plugin" plugin was found, injection was disabled, currently the builtin html is not supported.`,
                        );
                        injectionStatus = "NOT_SUPPORTED";
                    }
                }
            });
        },
        vite: {
            configResolved(viteConfig) {
                base = viteConfig.base;

                viteConfig.plugins.forEach((plugin) => {
                    if (frontendFramework === undefined && plugin.name.includes("sveltekit")) {
                        frontendFramework = "sveltekit";
                        config.outputPath = "_app/immutable/assets/";
                    } else if (frontendFramework === undefined && plugin.name.includes("astro")) {
                        frontendFramework = "astro";
                    }
                });
            },
            generateBundle(_, bundle) {
                consola.info(frontendFramework);
                // @see https://github.com/withastro/astro/issues/7695
                if (frontendFramework === "astro") {
                    Object.keys(bundle).forEach((key) => {
                        const asset = bundle[key] as OutputChunk;

                        if (asset?.facadeModuleId?.includes(".astro")) {
                            asset.code = asset.code.replaceAll(/<link rel="icon".*?>/gu, "");
                            asset.code = asset.code.replace("</head>", `${parsedHtml.map((tag) => tag.fragment).join("")}</head>`);
                        }
                    });
                }
            },
            transformIndexHtml: {
                enforce: "post",
                transform(html) {
                    if (injectionStatus === "ENABLED") {
                        // eslint-disable-next-line no-param-reassign
                        html = html.replaceAll(/<link rel="icon".*?>/gu, "");
                        // eslint-disable-next-line no-param-reassign
                        html = html.replace("</head>", `${parsedHtml.map((tag) => tag.fragment).join("")}</head>`);

                        return html;
                    }

                    return html;
                },
            },
        },
        webpack(compiler) {
            if (compiler.options.output.path?.includes(".next")) {
                config.outputPath = "static/media/favicons/";
                injectionStatus = "NOT_SUPPORTED";
            } else {
                base = "/";
            }

            compiler.hooks.make.tapPromise(PLUGIN_NAME, async (compilation) => {
                consola.info(compilation);
                if (injectionStatus === "ENABLED") {
                    // Hook into the html-webpack-plugin processing and add the html
                    injectHtmlPlugin(compilation, findHtmlWebpackPlugin(compilation));
                }
            });
        },
    };
};

export default unpluginFactory;
