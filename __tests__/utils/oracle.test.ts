// eslint-disable-next-line import/no-unused-modules
import { beforeEach, describe, expect, it, vi } from "vitest";

import Oracle from "../../src/core/utils/oracle"; // You'll need a mocking library to mock the imports

const { readPackageUpSync } = vi.hoisted(() => {
    return { readPackageUpSync: vi.fn() };
});

vi.mock("read-pkg-up", async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment
    const module_ = (await importOriginal()) as any;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...module_,
        readPackageUpSync,
    };
});

describe("oracle", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should guess app name from package.json", () => {
        readPackageUpSync.mockReturnValueOnce({ packageJson: { name: "my-app" } });

        const oracle = new Oracle();
        const result = oracle.guessAppName();

        expect(result).toBe("my-app");
    });

    it("should return undefined if no app name in package.json", () => {
        readPackageUpSync.mockReturnValueOnce({ packageJson: {} });

        const oracle = new Oracle();
        const result = oracle.guessAppName();

        expect(result).toBeUndefined();
    });

    it("should guess description from package.json", () => {
        readPackageUpSync.mockReturnValueOnce({ packageJson: { description: "A sample app" } });

        const oracle = new Oracle();
        const result = oracle.guessDescription();

        expect(result).toBe("A sample app");
    });

    it("should return undefined if no description in package.json", () => {
        readPackageUpSync.mockReturnValueOnce({ packageJson: {} });

        const oracle = new Oracle();
        const result = oracle.guessDescription();

        expect(result).toBeUndefined();
    });

    it("should guess developer from package.json when author is a string", () => {
        readPackageUpSync.mockReturnValueOnce({ packageJson: { author: "John Doe <john@example.com> (http://example.com)" } });

        const oracle = new Oracle();
        const result = oracle.guessDeveloper();

        expect(result).toStrictEqual({
            email: "john@example.com",
            name: "John Doe",
            url: "http://example.com",
        });
    });

    it("should guess developer from package.json when author is an object", () => {
        readPackageUpSync.mockReturnValueOnce({ packageJson: { author: { email: "john@example.com", name: "John Doe", url: "http://example.com" } } });

        const oracle = new Oracle();
        const result = oracle.guessDeveloper();

        expect(result).toStrictEqual({
            email: "john@example.com",
            name: "John Doe",
            url: "http://example.com",
        });
    });

    it("should guess developer from package.json when maintainers are present", () => {
        readPackageUpSync.mockReturnValueOnce({
            packageJson: { maintainers: [{ email: "jane@example.com", name: "Jane Doe", url: "http://example.com/jane" }] },
        });

        const oracle = new Oracle();
        const result = oracle.guessDeveloper();

        expect(result).toStrictEqual({
            email: "jane@example.com",
            name: "Jane Doe",
            url: "http://example.com/jane",
        });
    });

    it("should return undefined for developer if no author or maintainers in package.json", () => {
        readPackageUpSync.mockReturnValueOnce({ packageJson: {} });

        const oracle = new Oracle();
        const result = oracle.guessDeveloper();

        expect(result).toStrictEqual({
            email: undefined,
            name: undefined,
            url: undefined,
        });
    });

    it("should guess version from package.json", () => {
        readPackageUpSync.mockReturnValueOnce({ packageJson: { version: "1.0.0" } });

        const oracle = new Oracle();
        const result = oracle.guessVersion();

        expect(result).toBe("1.0.0");
    });

    it("should return undefined if no version in package.json", () => {
        readPackageUpSync.mockReturnValueOnce({ packageJson: {} });

        const oracle = new Oracle();
        const result = oracle.guessVersion();

        expect(result).toBeUndefined();
    });
});
