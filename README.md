<div align="center">

<h1>A Favicons Plugin</h1>

Create and manage favicons with Vite, Rollup, Webpack, Rspack, Nuxt, Vue CLI, Svelte, esbuild and Astro on top of
[itgalaxy/favicons](https://github.com/itgalaxy/favicons)

[![typescript-image]][typescript-url] [![npm-image]][npm-url] [![license-image]][license-url]

</div>

---

<div align="center">
    <p>
        <sup>
            Daniel Bannert's open source work is supported by the community on <a href="https://github.com/sponsors/prisis">GitHub Sponsors</a>
        </sup>
    </p>
</div>

---

## Install

```bash
npm i -D @anolilab/unplugin-favicons favicons
```

```sh
yarn add -D @anolilab/unplugin-favicons favicons
```

```sh
pnpm add -D @anolilab/unplugin-favicons favicons
```

## Zero Config Usage

Add your base logo as `logo.png` file to your assets folder.

## Only declared icons generation

```ts
unpluginFavicons({
    /**
     * Specify each icon type to render. Unlike `favicons`, this plugin is
     * opt-in, meaning only the icon types you declare here will be rendered.
     *
     * For each icon type, all `favicons` options are supported. An
     * additional `source` property is required to indicate the asset to be
     * used for that icon type.
     */
    icons: {
        favicons: {
            source: "./assets/favicon.png",
        },
        android: {
            source: "./assets/android.png",
        },
        appleStartup: {
            source: "./assets/apple-startup.png",
        },
    },
});
```

### Add the plugin to your bundler as follow:

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import unpluginFavicons from "@anolilab/unplugin-favicons/vite";

export default defineConfig({
    plugins: [
        unpluginFavicons({
            /* options */
        }),
    ],
});
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import unpluginFavicons from "@anolilab/unplugin-favicons/rollup";
// To use the auto inject
import html from "@rollup/plugin-html";

export default {
    plugins: [
        // html(), // optional
        unpluginFavicons({
            /* options */
        }),
    ],
};
```

<br></details>

<details>
<summary>esbuild (Only generates the favicons)</summary><br>

```ts
// esbuild.config.js
import { build } from "esbuild";

build({
    plugins: [
        require("@anolilab/unplugin-favicons/esbuild")({
            /* options */
        }),
    ],
});
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
    /* ... */
    plugins: [
        require("@anolilab/unplugin-favicons/webpack")({
            /* options */
        }),
    ],
};
```

<br></details>

<details>
<summary>Vue CLI (Untested)</summary><br>

```ts
// vue.config.js
module.exports = {
    configureWebpack: {
        plugins: [
            require("@anolilab/unplugin-favicons/webpack")({
                /* options */
            }),
        ],
    },
};
```

<br></details>

<details>
<summary>Nuxt</summary><br>

Nuxt 2 and [Nuxt Bridge](https://github.com/nuxt/bridge)

```ts
// nuxt.config.js
export default {
    buildModules: [
        [
            "@anolilab/unplugin-favicons/nuxt",
            {
                /* options */
            },
        ],
    ],
};
```

Nuxt 3

```ts
// nuxt.config.js
export default defineNuxtConfig({
    modules: [
        [
            "@anolilab/unplugin-favicons/nuxt",
            {
                /* options */
            },
        ],
    ],
});
```

See [the Nuxt example](examples/nuxt) for a working example project.

<br></details>

<details>
<summary>SvelteKit</summary><br>

The `@anolilab/unplugin-favicons` plugin should be configured in the `vite.config.js` configuration file:

```ts
// vite.config.js
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import unpluginFavicons from "@anolilab/unplugin-favicons/vite";

export default defineConfig({
    plugins: [
        sveltekit(),
        unpluginFavicons({
            /* options */
        }),
    ],
});
```

Then add `src/hooks.server.ts` to rewrite the head tag with [`hooks`](https://kit.svelte.dev/docs/hooks):

```ts
import { metadata } from "@anolilab/unplugin-favicons/runtime"; // use default import
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event, {
        transformPageChunk: ({ html }) => html.replace("</head>", `${metadata}</head>`),
    });
    return response;
};
```

Check instructions in the `Frameworks -> Svelte` section below if you faced module import errors.

See [the SvelteKit example](examples/sveltekit) for a working example project.

<br></details>

<details>
<summary>Svelte + Vite</summary><br>

Svelte support requires the `@sveltejs/vite-plugin-svelte` plugin:

```shell
npm i -D @sveltejs/vite-plugin-svelte
```

The `@anolilab/unplugin-favicons` plugin should be configured in the `vite.config.js` configuration file:

```ts
// vite.config.js
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import unpluginFavicons from "@anolilab/unplugin-favicons/vite";

export default defineConfig({
    plugins: [
        svelte(),
        unpluginFavicons({
            /* options */
        }),
    ],
});
```

Check instructions in the `Frameworks -> Svelte` section below if you faced module import errors.

See [the Svelte + Vite example](examples/vite-svelte) for a working example project.

<br></details>

<details>
<summary>Next.js (Not Supported for now)</summary><br>

The `@anolilab/unplugin-favicons` plugin should be configured on `next.config.js` configuration file:

```js
/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    webpack(config) {
        config.plugins.push(
            require("@anolilab/unplugin-favicons/webpack")({
                /* options */
            }),
        );

        return config;
    },
};
```

Check instructions in the `Frameworks -> React` section below if you faced module import errors.

See [the Next.js example](examples/next) for a working example project.

<br></details>

<details>
<summary>Astro</summary><br>

```ts
// astro.config.mjs
import { defineConfig } from "astro/config";
import unpluginFavicons from "@anolilab/unplugin-favicons/vite";

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [
            unpluginFavicons({
                /* options */
            }),
        ],
    },
});
```

See [the Astro example](examples/astro) for a working example project.

<br></details>

The default configuration will automatically generate webapp manifest files along with 44 different icon formats as appropriate for iOS devices, Android devices, Windows Phone and various desktop browsers out of your single `logo.png`.

> **Tip:** You might want to [fine tune](#advanced-usage) what vendors to support.

### A Note on Path Resolution

Under the hood, Vite/Rollup resolve the paths to the logo and favicons according to the following
rules:

- If `/path/to/logo` is absolute, there is nothing to resolve and the path
  specified is used as is.

- If `./path/to/logo` is relative, it’s resolved with respect to `process.cwd()`.

### HTML Injection

In combination with [Vite’s html plugin hooks](https://vitejs.dev/guide/api-plugin.html#transformindexhtml) it will also inject the necessary html for you:

```html
<link rel="apple-touch-icon" sizes="57x57" href="/assets/apple-touch-icon-57x57.png" />
<link rel="apple-touch-icon" sizes="60x60" href="/assets/apple-touch-icon-60x60.png" />
<link rel="apple-touch-icon" sizes="72x72" href="/assets/apple-touch-icon-72x72.png" />
<link rel="apple-touch-icon" sizes="76x76" href="/assets/apple-touch-icon-76x76.png" />
<link rel="apple-touch-icon" sizes="114x114" href="/assets/apple-touch-icon-114x114.png" />
<link rel="apple-touch-icon" sizes="120x120" href="/assets/apple-touch-icon-120x120.png" />
<link rel="apple-touch-icon" sizes="144x144" href="/assets/apple-touch-icon-144x144.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/assets/apple-touch-icon-152x152.png" />
<link rel="apple-touch-icon" sizes="167x167" href="/assets/apple-touch-icon-167x167.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon-180x180.png" />
<link rel="apple-touch-icon" sizes="1024x1024" href="/assets/apple-touch-icon-1024x1024.png" />
<link
    rel="apple-touch-startup-image"
    media="(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 1)"
    href="/assets/apple-touch-startup-image-320x460.png"
/>
<link
    rel="apple-touch-startup-image"
    media="(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 2)"
    href="/assets/apple-touch-startup-image-640x920.png"
/>
<link
    rel="apple-touch-startup-image"
    media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
    href="/assets/apple-touch-startup-image-640x1096.png"
/>
<link
    rel="apple-touch-startup-image"
    media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
    href="/assets/apple-touch-startup-image-750x1294.png"
/>
<link
    rel="apple-touch-startup-image"
    media="(device-width: 414px) and (device-height: 736px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 3)"
    href="/assets/apple-touch-startup-image-1182x2208.png"
/>
<link
    rel="apple-touch-startup-image"
    media="(device-width: 414px) and (device-height: 736px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 3)"
    href="/assets/apple-touch-startup-image-1242x2148.png"
/>
<link
    rel="apple-touch-startup-image"
    media="(device-width: 768px) and (device-height: 1024px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 1)"
    href="/assets/apple-touch-startup-image-748x1024.png"
/>
<link
    rel="apple-touch-startup-image"
    media="(device-width: 768px) and (device-height: 1024px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 2)"
    href="/assets/apple-touch-startup-image-1496x2048.png"
/>
<link
    rel="apple-touch-startup-image"
    media="(device-width: 768px) and (device-height: 1024px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 1)"
    href="/assets/apple-touch-startup-image-768x1004.png"
/>
<link
    rel="apple-touch-startup-image"
    media="(device-width: 768px) and (device-height: 1024px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 2)"
    href="/assets/apple-touch-startup-image-1536x2008.png"
/>
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="228x228" href="/assets/coast-228x228.png" />
<link rel="manifest" href="/assets/manifest.json" />
<link rel="shortcut icon" href="/assets/favicon.ico" />
<link rel="yandex-tableau-widget" href="/assets/yandex-browser-manifest.json" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" />
<meta name="application-name" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="msapplication-TileColor" content="#fff" />
<meta name="msapplication-TileImage" content="/assets/mstile-144x144.png" />
<meta name="msapplication-config" content="/assets/browserconfig.xml" />
<meta name="theme-color" content="#fff" />
```

## Advanced Usage

```javascript
  unpluginFavicons({
    /** Your source logo (Will default to ) */
    logo?: "assets/logo.png",
    /** Inject html links/metadata. */
    inject?: true,
    /** `Favicons` configuration options
    *  - [See `favicons` documentation](https://github.com/itgalaxy/favicons) */
    favicons?: FaviconsConfig,
    /** The root of the project from which you want to load metadata */
    projectRoot?: process.cwd(),
  })
```

To fine tune what icons/metadata is generated, refer to
[favicons’ documentation](https://github.com/itgalaxy/favicons#usage).

The options specified under `favicons:` are handed over as is to [favicons],
except that if `appName`, `appDescription`, `version`, `developerName` or
`developerURL` are left `undefined`, they will be automatically inferred
respectively from `name`, `description`, `version`, `author.name` and
`author.url` as defined in the nearest `package.json` if available.
And if there’s no `author` it will use the first in the `contributors`.
To disable automatically retrieving metadata from `package.json`, set
to `null` the properties you want to omit.

### Examples

#### Basic

```javascript
unpluginFavicons({
    logo: "./src/logo.png", // svg works too!
    favicons: {
        appName: "my-app",
        appDescription: "My awesome App",
        developerName: "Me",
        developerURL: null, // prevent retrieving from the nearest package.json
        background: "#ddd",
        theme_color: "#333",
        icons: {
            coast: false,
            yandex: false,
        },
    },
});
```

To fine tune what icons/metadata is generated, refer to
[favicons’ documentation](https://github.com/itgalaxy/favicons#usage).

#### Handling Multiple HTML Files

Vite calls the HTML transform hook for each HTML file template file you have configured in Vite, so this works automatically.

### Runtime

The `@anolilab/unplugin-favicons` plugin also exports a runtime module that can be used to inject the generated metadata into your HTML files or access the `files` and `images` used in the metadata.

```ts
import { metadata, images, files } from "@anolilab/unplugin-favicons/runtime";

console.log(metadata, images, files);
```

## Changelog

Take a look at the [CHANGELOG.md](https://github.com/anolilab/unplugin-favicons/blob/main/CHANGELOG.md).

## Contribution

You’re free to contribute to this project by submitting [issues](https://github.com/anolilab/unplugin-favicons/issues) and/or [pull requests](https://github.com/anolilab/unplugin-favicons/pulls).

Please keep in mind that every change and feature should be covered by
tests.

## License

This project is licensed under [MIT](https://github.com/anolilab/unplugin-favicons/blob/main/LICENSE.md).

## Supported Node.js Versions

Libraries in this ecosystem make the best effort to track
[Node.js’ release schedule](https://nodejs.org/en/about/releases/). Here’s [a
post on why we think this is important](https://medium.com/the-node-js-collection/maintainers-should-consider-following-node-js-release-schedule-ab08ed4de71a).

## Contributing

If you would like to help take a look at the [list of issues](https://github.com/anolilab/vite-plugin-favicon/issues) and check our [Contributing](.github/CONTRIBUTING.md) guild.

> **Note:** please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms.

## Credits

- [Daniel Bannert](https://github.com/prisis)
- [All Contributors](https://github.com/anolilab/vite-plugin-favicon/graphs/contributors)

## License

The anolilab vite-plugin-favicon is open-sourced software licensed under the [MIT license](https://opensource.org/license/mit/)

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]: "typescript"
[license-image]: https://img.shields.io/npm/l/@anolilab/unplugin-favicons?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"
[npm-image]: https://img.shields.io/npm/v/@anolilab/unplugin-favicons/latest.svg?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/login?next=%2Fpackage%2F%40anolilab%2Funplugin-favicons%2Fv%2Flatest "npm"
