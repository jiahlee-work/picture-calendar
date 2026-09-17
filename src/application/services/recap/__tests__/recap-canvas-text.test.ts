import { describe, expect, it } from "vitest";

import {
  DEFAULT_RECAP_TEXT_COLOR,
  DEFAULT_RECAP_TEXT_FONT_SIZE,
  DEFAULT_RECAP_TEXT_WIDTH,
  isRecapTextAlignmentSelected,
  isRecapTextStyleSelected,
  normalizeRecapCanvasTextElement,
  normalizeRecapTextColor,
  normalizeRecapTextFontFamily,
  normalizeRecapTextFontSize,
  normalizeRecapTextWidth,
  resolveRecapTextAlignmentUpdate,
  resolveRecapTextStyleUpdate,
} from "@/application/services/recap/recap-canvas-text";
import type { RecapCanvasTextElement } from "@/shared/recap/types";

describe("recap canvas text", () => {
  it("normalizes text colors to a canonical six-digit hex value", () => {
    expect(normalizeRecapTextColor("  #ABC  ")).toBe("#aabbcc");
    expect(normalizeRecapTextColor("#A1B2C3")).toBe("#a1b2c3");
    expect(normalizeRecapTextColor("invalid")).toBe(DEFAULT_RECAP_TEXT_COLOR);
  });

  it("normalizes typography values within the canvas limits", () => {
    expect(normalizeRecapTextFontFamily("  Menlo ")).toBe("Menlo");
    expect(normalizeRecapTextFontFamily("   ")).toBeUndefined();
    expect(normalizeRecapTextFontFamily("Unknown Font")).toBeUndefined();
    expect(normalizeRecapTextFontSize(Number.NaN)).toBe(
      DEFAULT_RECAP_TEXT_FONT_SIZE,
    );
    expect(normalizeRecapTextFontSize(2)).toBe(8);
    expect(normalizeRecapTextFontSize(999)).toBe(180);
    expect(normalizeRecapTextWidth(undefined)).toBe(DEFAULT_RECAP_TEXT_WIDTH);
    expect(normalizeRecapTextWidth(10)).toBe(72);
    expect(normalizeRecapTextWidth(900)).toBe(720);
  });

  it("fills legacy optional text styles with stable defaults", () => {
    expect(
      normalizeRecapCanvasTextElement(
        createTextElement({
          color: "#FFF",
          fontFamily: " ",
          fontSize: 24.4,
          width: undefined,
        }),
      ),
    ).toMatchObject({
      color: "#ffffff",
      fontFamily: undefined,
      fontSize: 24,
      fontStyle: "normal",
      fontWeight: "normal",
      textAlign: "left",
      textDecorationLine: "none",
      width: 340,
    });
  });

  it("toggles text styles from the current element state", () => {
    const element = createTextElement({
      fontStyle: "italic",
      fontWeight: "normal",
      textDecorationLine: "underline",
    });

    expect(isRecapTextStyleSelected(element, "italic")).toBe(true);
    expect(resolveRecapTextStyleUpdate(element, "italic")).toEqual({
      fontStyle: "normal",
    });
    expect(resolveRecapTextStyleUpdate(element, "bold")).toEqual({
      fontWeight: "bold",
    });
    expect(resolveRecapTextStyleUpdate(element, "underline")).toEqual({
      textDecorationLine: "none",
    });
  });

  it("resolves alignment selection and updates", () => {
    const element = createTextElement({ textAlign: undefined });

    expect(isRecapTextAlignmentSelected(element, "left")).toBe(true);
    expect(isRecapTextAlignmentSelected(element, "center")).toBe(false);
    expect(resolveRecapTextAlignmentUpdate("right")).toEqual({
      textAlign: "right",
    });
  });
});

function createTextElement(
  overrides: Partial<RecapCanvasTextElement> = {},
): RecapCanvasTextElement {
  return {
    id: "text-1",
    color: "#121212",
    content: "text",
    fontSize: 24,
    rotation: 0,
    scale: 1,
    type: "text",
    width: 340,
    x: 0,
    y: 0,
    zIndex: 1,
    ...overrides,
  };
}
