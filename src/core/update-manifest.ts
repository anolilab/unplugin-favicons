import type { AndroidManifest, EmittedFile, FirefoxManifest } from "../types";
import findEmittedFile from "./utils/find-emitted-file";

/**
 * Provided a list of EmittedFile objects from Vite and an Android or Firefox
 * manifest's contents, updates each icon's source to reflect the final name
 * generated for the file by Vite.
 */
const updateManifest = (emittedImages: EmittedFile[], manifestContents: string): string => {
    const parsedManifest: AndroidManifest | FirefoxManifest = JSON.parse(manifestContents) as AndroidManifest | FirefoxManifest;

    // Handles Android's manifest format.
    if (Array.isArray(parsedManifest.icons)) {
        parsedManifest.icons = parsedManifest.icons.map((iconDescriptor) => {
            const correspondingFile = findEmittedFile(emittedImages, iconDescriptor.src);

            if (!correspondingFile) {
                throw new Error(`Unable to find a corresponding emitted file for manifest entry: ${iconDescriptor.src}`);
            }

            return { ...iconDescriptor, src: `/${correspondingFile.resolvedName}` };
        });
        // Handles Firefox's manifest format.
    } else if (typeof parsedManifest.icons === "object" && Object.keys(parsedManifest.icons).length > 0) {
        parsedManifest.icons = Object.fromEntries(
            Object.entries(parsedManifest.icons).map(([size, source]) => {
                const correspondingFile = findEmittedFile(emittedImages, source);

                if (!correspondingFile) {
                    throw new Error(`Unable to find a corresponding emitted file for manifest entry: ${source}`);
                }

                return [size, `/${correspondingFile.resolvedName}`];
            }),
        );
    }

    return JSON.stringify(parsedManifest);
};

export default updateManifest;
