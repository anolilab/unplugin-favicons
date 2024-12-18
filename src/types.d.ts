import type { FaviconOptions } from "favicons";
import type { ReadonlyDeep, ValueOf, Writable } from "type-fest";

/**
 * List of valid platform names / icon types accepted by favicons. Should be
 * identical to `favicons` `PlatformName` type, which was made a private type in
 * version 7.0.0.
 */
type FaviconsIconTypes = keyof NonNullable<FaviconOptions["icons"]>;

/**
 * This should be similar to the `IconOptions` type from `favicons`, which was
 * made private in version 7.0.0. All options here are optional and writable.
 */
type FaviconsIconOptions = Writable<Partial<Exclude<ValueOf<NonNullable<FaviconOptions["icons"]>>, string[] | boolean>>>;

type FaviconsIconsOptions = {
    [K in FaviconsIconTypes]?: FaviconsIconOptions & {
        /**
         * Source image to use for this icon type.
         */
        source: string;
    };
};

interface BaseFaviconsPluginOptions {
    /**
     * Whether to cache generated assets for faster subsequent builds.
     *
     * @default `true`
     */
    cache?: boolean;
    /**
     * Inject html links/metadata -- set to `false` to generate a webapp.html` file.
     * @default true
     */
    inject?: boolean;
    /**
     * Output Path for the favicon images & files, relative to the Vite assets directory
     */
    outputPath?: string;
    /**
     * The root of the project from which you want to load metadata
     * @default process.cwd()
     */
    projectRoot?: string;
}

type FaviconsConfig = Partial<FaviconOptions>;

export interface FaviconsLogoPluginOptions extends BaseFaviconsPluginOptions {
    /**
     * `Favicons` configuration options
     *  - [See `favicons` documentation](https://github.com/itgalaxy/favicons)
     */
    favicons?: FaviconsConfig;
    /**
     * Your source logo (Will default to )
     * @default "assets/logo.png"
     */
    logo?: string;
}

export interface FaviconsIconsPluginOptions extends BaseFaviconsPluginOptions, ReadonlyDeep<FaviconOptions> {
    /**
     * `Favicons` configuration options
     *  - [See `favicons` documentation](https://github.com/itgalaxy/favicons)
     */
    favicons?: Omit<FaviconsConfig, "icons">;
    /**
     * Options for rendering supported icon types. Keys should be supported icon
     * types from `favicons` and values should be an object containing a `source`
     * and any other properties from `favicons` IconOptions type.
     */
    icons: FaviconsIconsOptions;
}

export interface JobConfig {
    config: FaviconOptions["icons"][this["iconType"]];
    iconType: keyof FaviconOptions["icons"] | "logo";
    source: string;
}

export interface AndroidManifest {
    background_color: string;
    description: string;
    dir: string;
    display: string;
    icons: {
        sizes: string;
        src: string;
        type: string;
    }[];
    lang: string;
    name: string;
    orientation: string;
    short_name: string;
    start_url: string;
    theme_color: string;
}

export interface FirefoxManifest {
    description: string;
    developer: {
        name: string;
        url: string;
    };
    icons: Record<string, string>;
    name: string;
    version: string;
}

/**
 * Object used to describe a file emitted to a Vite compilation.
 */
export interface EmittedFile {
    /**
     * Original file name.
     */
    name: string;

    /**
     * Name that will be used for the file in the compilation.
     */
    resolvedName: string;
}

export interface HtmlTagDescriptor {
    attrs?: Record<string, boolean | string | undefined>;
    children?: HtmlTagDescriptor[] | string;
    fragment: string;
    /**
     * default: 'head-prepend'
     */
    injectTo?: "body-prepend" | "body" | "head-prepend" | "head";
    tag: string;
}

export type Runtime = {
    images: EmittedFile[];
    files: EmittedFile[];
    metadata: string;
};
