import { join } from "node:path";

import { favicons } from "favicons";
import { describe, expect, it, vi } from "vitest";

import generateFavicons from "../../src/core/generate/generate-favicons";

const { mockedFavicons, mockedGetCacheResponse, mockedPutCacheResponse } = vi.hoisted(() => {
    return {
        // The fixtures intentionally use partial shapes; typing these mocks to the
        // real signatures would force a rewrite of the test data, not the behaviour.
        // eslint-disable-next-line vitest/require-mock-type-parameters
        mockedFavicons: vi.fn(),
        // eslint-disable-next-line vitest/require-mock-type-parameters
        mockedGetCacheResponse: vi.fn(),
        // eslint-disable-next-line vitest/require-mock-type-parameters
        mockedPutCacheResponse: vi.fn(),
    };
});

vi.mock(import("favicons"), () => {
    return {
        favicons: mockedFavicons,
    };
});

vi.mock(import("../../src/core/generate/put-cache-response"), () => {
    return {
        default: mockedPutCacheResponse,
    };
});

vi.mock(import("../../src/core/generate/get-cache-response"), () => {
    return {
        default: mockedGetCacheResponse,
    };
});

const logoPath = join(__dirname, "..", "..", "__fixtures__", "assets", "logo.png");

const logo1Path = join(__dirname, "..", "..", "__fixtures__", "assets", "logo_1.png");

const logo2Path = join(__dirname, "..", "..", "__fixtures__", "assets", "logo_2.png");

describe("generateFavicons", () => {
    it("should generate favicons from a single logo source", async () => {
        expect.assertions(2);

        const options = { logo: logoPath };
        const response = { files: [], html: [], htmlTags: [], images: [] };

        mockedFavicons.mockResolvedValue(response);

        const result = await generateFavicons(options);

        expect(result).toStrictEqual(response);
        expect(favicons).toHaveBeenCalledWith(logoPath, expect.any(Object));
    });

    it("should generate favicons from multiple icon sources", async () => {
        expect.assertions(2);

        const options = { icons: { android: { source: logoPath } } };
        const response = { files: [], html: [], htmlTags: [], images: [] };

        mockedFavicons.mockResolvedValue(response);

        const result = await generateFavicons(options);

        expect(result).toStrictEqual(response);
        expect(favicons).toHaveBeenCalledWith(logoPath, expect.any(Object));
    });

    it("should cache the generated favicons if caching is enabled", async () => {
        expect.assertions(1);

        const options = { cache: true, logo: logoPath };
        const response = { files: [], html: [], htmlTags: [], images: [] };

        mockedFavicons.mockResolvedValue(response);

        mockedPutCacheResponse.mockResolvedValue(() => {});

        await generateFavicons(options);

        expect(mockedPutCacheResponse).toHaveBeenCalledWith(expect.any(String), response, "logo");
    });

    it("should retrieve favicons from cache if available", async () => {
        expect.assertions(2);

        const options = { cache: true, logo: logoPath };
        const cachedResponse = { files: [], html: [], htmlTags: [], images: [] };

        mockedPutCacheResponse.mockResolvedValue(() => {});
        mockedGetCacheResponse.mockResolvedValue(cachedResponse);

        const result = await generateFavicons(options);

        expect(mockedGetCacheResponse).toHaveBeenCalledWith(expect.any(String), "logo");
        expect(result).toStrictEqual(cachedResponse);
    });

    it("should merge multiple favicon responses into a single response", async () => {
        expect.assertions(3);

        const options = { icons: { android: { source: logo1Path }, appleIcon: { source: logo2Path } } };
        const response1 = { files: ["file1"], html: ["html1"], images: ["image1"] };
        const response2 = { files: ["file2"], html: ["html2"], images: ["image2"] };

        mockedFavicons.mockResolvedValueOnce(response1).mockResolvedValueOnce(response2);

        const result = await generateFavicons(options);

        expect(result.files).toStrictEqual(["file1", "file2"]);
        expect(result.images).toStrictEqual(["image1", "image2"]);
        expect(result.html).toStrictEqual(["html1", "html2"]);
    });

    it("should handle missing logo source", async () => {
        expect.assertions(1);

        const options = {};

        await expect(async () => generateFavicons(options)).rejects.toThrow("no such file or directory");
    });

    it("should handle invalid source paths", async () => {
        expect.assertions(1);

        const options = { logo: "invalid/path/to/logo.png" };

        mockedFavicons.mockRejectedValue(new Error("Invalid path"));

        await expect(generateFavicons(options)).rejects.toThrow("no such file or directory");
    });
});
