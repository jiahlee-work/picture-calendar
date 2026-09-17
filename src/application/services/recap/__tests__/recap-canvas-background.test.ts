import { describe, expect, it } from "vitest";

import {
  DEFAULT_RECAP_CANVAS_BACKGROUND_COLOR,
  isDefaultRecapCanvasBackgroundColor,
  normalizeRecapCanvasBackgroundColor,
} from "@/application/services/recap/recap-canvas-background";

describe("recap canvas background", () => {
  it("normalizes hex color case and whitespace", () => {
    expect(normalizeRecapCanvasBackgroundColor("  #FaCc15 ")).toBe("#facc15");
  });

  it("expands shorthand hex colors", () => {
    expect(normalizeRecapCanvasBackgroundColor("#AbC")).toBe("#aabbcc");
  });

  it("falls back to the default for empty or invalid colors", () => {
    expect(normalizeRecapCanvasBackgroundColor(undefined)).toBe(
      DEFAULT_RECAP_CANVAS_BACKGROUND_COLOR,
    );
    expect(normalizeRecapCanvasBackgroundColor("not-a-color")).toBe(
      DEFAULT_RECAP_CANVAS_BACKGROUND_COLOR,
    );
  });

  it("treats equivalent white values as the default background", () => {
    expect(isDefaultRecapCanvasBackgroundColor("#FFFFFF")).toBe(true);
    expect(isDefaultRecapCanvasBackgroundColor("#fff")).toBe(true);
    expect(isDefaultRecapCanvasBackgroundColor("#fefefe")).toBe(false);
  });
});
