// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    modules: [
        [
            "@anolilab/unplugin-favicons/nuxt",
            {
                logo: "./assets/logo.png",
                appName: "redacted",
                developerName: "redacted",
                developerURL: "redacted",
                background: "#bada55",
                theme_color: "#c0ff33",
                icons: {
                    windows: false,
                    yandex: false,
                },
            },
        ],
    ],
});
