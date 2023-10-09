import faviconsPlugin from "@anolilab/unplugin-favicons/webpack";

/** @type {import('next').NextConfig} */
export default {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
        config.plugins.push(faviconsPlugin());

        return config;
    },
};
