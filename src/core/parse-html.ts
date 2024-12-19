import { parseFragment } from "parse5";
// @ts-expect-error - No types available
import type { Attribute, Element } from "parse5/dist/tree-adapters/default";

import type { EmittedFile, HtmlTagDescriptor } from "../types";
import findEmittedFile from "./utils/find-emitted-file";

/**
 * Provided an array of EmittedFile objects and an array of HTML strings
 * returned by `favicons`, updates the href attributes in each <link> node to
 * contain the resolved file name produced by Vite rather than the original
 * input filename. Returns an array of HtmlTagDescriptor objects that may be
 * returned by `transformHtml`.
 *
 * See: https://vitejs.dev/guide/api-plugin.html#transformindexhtml
 */
const parseHtml = (emittedFiles: EmittedFile[], fragments: string[], base = "/"): HtmlTagDescriptor[] =>
    fragments.flatMap((fragment) => {
        const originalFragment = fragment;
        const parsedFragment = parseFragment(fragment);

        // Map over each child node in the fragment
        return parsedFragment.childNodes
            .map((childNode) => {
                // Then map over each of its attributes
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
                const mappedAttributes = (childNode as Element).attrs.map((attribute: Attribute) => {
                    // If the attribute is of type "href"
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    if (attribute.name === "href") {
                        // Locate the file descriptor for this element by matching our
                        // href to the file's resolved name.
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
                        const correspondingFile = findEmittedFile(emittedFiles, attribute.value);

                        // Finally, update the href attribute from the original file name
                        // to the resolved file name.
                        // we should respect base options defined in vite.config
                        if (correspondingFile) {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,no-param-reassign
                            attribute.value = `${base}${correspondingFile.resolvedName}`;
                        } else {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            throw new Error(`Unable to find a corresponding file for href: ${attribute.value}`);
                        }
                    }

                    // Return an entry tuple for this attribute name/value pair.
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    return [attribute.name, attribute.value] as string[];
                });

                return {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    attrs: Object.fromEntries(mappedAttributes),
                    fragment: originalFragment,
                    injectTo: "head",
                    tag: childNode.nodeName,
                } as HtmlTagDescriptor;
            })
            .filter(Boolean);
    });

export default parseHtml;
