import head from "@anolilab/unplugin-favicons/runtime";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event, {
        transformPageChunk: ({ html }) => html.replace("</head>", `${head}</head>`),
    });
    return response;
};
