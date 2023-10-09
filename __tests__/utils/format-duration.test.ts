// eslint-disable-next-line import/no-unused-modules
import { describe, expect, it } from "vitest";

import formatDuration from "../../src/core/utils/format-duration";

describe("formatDuration", () => {
    it("should handle negative duration", () => {
        const result = formatDuration(-5000);
        expect(result).toBe("5 seconds");
    });

    it("should format duration less than a second", () => {
        const result = formatDuration(500);
        expect(result).toBe("500 ms");
    });

    it("should format duration in seconds", () => {
        const result = formatDuration(5000);
        expect(result).toBe("5 seconds");
    });

    it("should format duration in minutes", () => {
        const result = formatDuration(120_000);
        expect(result).toBe("2 minutes");
    });

    it("should format duration in hours", () => {
        const result = formatDuration(3_600_000);
        expect(result).toBe("1 hour");
    });

    it("should format duration in days", () => {
        const result = formatDuration(86_400_000);
        expect(result).toBe("1 day");
    });

    it("should format combination of days, hours, minutes, seconds, and milliseconds", () => {
        const result = formatDuration(90_725_500);
        expect(result).toBe("1 day, 1 hour, 12 minutes, 5 seconds, 500 ms");
    });
});
