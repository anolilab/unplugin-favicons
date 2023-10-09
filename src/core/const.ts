export const PLUGIN_NAME = "@anolilab/unplugin-favicons";

/**
 * By default, `favicons` renders assets for each icon type and config is used
 * to opt-out. This plugin prefers an opt-in strategy, so we merge incoming
 * configuration with this object to ensure `favicons` only renders the assets
 * the user explicit declared.
 */
export const DEFAULT_ICON_OPTIONS = {
    android: false,
    appleIcon: false,
    appleStartup: false,
    coast: false,
    favicons: false,
    firefox: false,
    windows: false,
    yandex: false,
};

export const DEFAULT_FAVICONS_OPTIONS = {
    appShortName: undefined, // Your application's short_name. `string`. Optional. If not set, appName will be used
    appleStatusBarStyle: "black-translucent", // Style for Apple status bar: "black-translucent", "default", "black". `string`
    background: "#fff", // Background colour for flattened icons. `string`
    dir: "auto", // Primary text direction for name, short_name, and description
    display: "standalone", // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
    icons: {
        // Platform Options:
        // - offset - offset in percentage
        // - background:
        //   * false - use default
        //   * true - force use default, e.g. set background for Android icons
        //   * color - set background for the specified icons
        //   * mask - apply mask in order to create circle icon (applied by default for firefox). `boolean`
        //   * overlayGlow - apply glow effect after mask has been applied (applied by default for firefox). `boolean`
        //   * overlayShadow - apply drop shadow after mask has been applied .`boolean`
        //
        android: true, // Create Android homescreen icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        appleIcon: true, // Create Apple touch icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        appleStartup: true, // Create Apple startup images. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        favicons: true, // Create regular favicons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        windows: true, // Create Windows 8 tile icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        // @see https://github.com/itgalaxy/favicons/issues/413
        yandex: false, // Create Yandex browser icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
    },
    lang: "en-US", // Primary language for name and short_name
    loadManifestWithCredentials: false, // Browsers don't send cookies when fetching a manifest, enable this to fix that. `boolean`
    orientation: "any", // Default orientation: "any", "natural", "portrait" or "landscape". `string`
    pixel_art: false, // Keeps pixels "sharp" when scaling up, for pixel art.  Only supported in offline mode.
    scope: "/", // set of URLs that the browser considers within your app
    start_url: "/?homescreen=1", // Start URL when launching the application from a device. `string`
    theme_color: "#fff", // Theme color user for example in Android's task switcher. `string`
    version: "1.0", // Your application's version string. `string`
};
