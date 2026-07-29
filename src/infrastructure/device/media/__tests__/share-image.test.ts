import { describe, expect, it } from "vitest";

import { toSharePngFileName } from "@/infrastructure/device/media/share-file-name";

describe("toSharePngFileName", () => {
  it("keeps the month-year file name and adds the png extension", () => {
    expect(toSharePngFileName("2026-06")).toBe("2026-06.png");
  });

  it("does not duplicate the png extension", () => {
    expect(toSharePngFileName("2026-06.png")).toBe("2026-06.png");
  });

  it("falls back to a stable file name when the source has no safe file characters", () => {
    expect(toSharePngFileName("")).toBe("pical-share.png");
  });
});
