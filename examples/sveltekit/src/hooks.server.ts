import { metadata } from "@anolilab/unplugin-favicons/runtime";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event, {
        transformPageChunk: ({ html }) => html.replace("</head>", `${metadata}</head>`),
    });

    return response;
};
