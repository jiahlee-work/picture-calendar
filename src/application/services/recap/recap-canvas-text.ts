import type {
  RecapCanvasElement,
  RecapCanvasTextElement,
} from "@/shared/recap/types";
import { RECAP_TEXT_FONT_FAMILIES } from "@/shared/recap/recap-font-families";

export type RecapTextStyleActionId = "bold" | "italic" | "underline";
export type RecapTextAlignmentActionId = "center" | "left" | "right";

export type RecapTextStyleUpdate = Partial<
  Pick<
    RecapCanvasTextElement,
    "fontStyle" | "fontWeight" | "textAlign" | "textDecorationLine"
  >
>;

export const DEFAULT_RECAP_TEXT_COLOR = "#121212";
export const DEFAULT_RECAP_TEXT_FONT_SIZE = 24;
export const DEFAULT_RECAP_TEXT_WIDTH = 340;
export const MIN_RECAP_TEXT_FONT_SIZE = 8;
export const MAX_RECAP_TEXT_FONT_SIZE = 180;
export const MIN_RECAP_TEXT_WIDTH = 72;
export const MAX_RECAP_TEXT_WIDTH = 720;

const SIX_DIGIT_HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const THREE_DIGIT_HEX_COLOR_PATTERN = /^#[0-9a-f]{3}$/i;
export function normalizeRecapTextColor(color: string | undefined): string {
  const trimmedColor = color?.trim();

  if (!trimmedColor) {
    return DEFAULT_RECAP_TEXT_COLOR;
  }

  if (SIX_DIGIT_HEX_COLOR_PATTERN.test(trimmedColor)) {
    return trimmedColor.toLowerCase();
  }

  if (THREE_DIGIT_HEX_COLOR_PATTERN.test(trimmedColor)) {
    const [red, green, blue] = trimmedColor.slice(1);

    return `#${red}${red}${green}${green}${blue}${blue}`.toLowerCase();
  }

  return DEFAULT_RECAP_TEXT_COLOR;
}

export function normalizeRecapTextFontFamily(
  fontFamily: string | undefined,
): string | undefined {
  const trimmedFontFamily = fontFamily?.trim();

  return trimmedFontFamily && RECAP_TEXT_FONT_FAMILIES.has(trimmedFontFamily)
    ? trimmedFontFamily
    : undefined;
}

export function normalizeRecapTextFontSize(fontSize: number): number {
  if (!Number.isFinite(fontSize)) {
    return DEFAULT_RECAP_TEXT_FONT_SIZE;
  }

  return Math.round(
    clamp(fontSize, MIN_RECAP_TEXT_FONT_SIZE, MAX_RECAP_TEXT_FONT_SIZE),
  );
}

export function normalizeRecapTextWidth(width: number | undefined): number {
  if (width === undefined || !Number.isFinite(width)) {
    return DEFAULT_RECAP_TEXT_WIDTH;
  }

  return Math.round(clamp(width, MIN_RECAP_TEXT_WIDTH, MAX_RECAP_TEXT_WIDTH));
}

export function normalizeRecapCanvasTextElement(
  element: RecapCanvasTextElement,
): RecapCanvasTextElement {
  return {
    ...element,
    color: normalizeRecapTextColor(element.color),
    fontFamily: normalizeRecapTextFontFamily(element.fontFamily),
    fontSize: normalizeRecapTextFontSize(element.fontSize),
    fontStyle: element.fontStyle === "italic" ? "italic" : "normal",
    fontWeight: element.fontWeight === "bold" ? "bold" : "normal",
    textAlign:
      element.textAlign === "center" || element.textAlign === "right"
        ? element.textAlign
        : "left",
    textDecorationLine:
      element.textDecorationLine === "underline" ? "underline" : "none",
    width: normalizeRecapTextWidth(element.width),
  };
}

export function normalizeRecapCanvasTextElements(
  elements: RecapCanvasElement[],
): RecapCanvasElement[] {
  return elements.map((element) =>
    element.type === "text"
      ? normalizeRecapCanvasTextElement(element)
      : { ...element },
  );
}

export function isRecapTextStyleSelected(
  element: RecapCanvasTextElement,
  actionId: RecapTextStyleActionId,
): boolean {
  if (actionId === "bold") {
    return element.fontWeight === "bold";
  }

  if (actionId === "italic") {
    return element.fontStyle === "italic";
  }

  return element.textDecorationLine === "underline";
}

export function resolveRecapTextStyleUpdate(
  element: RecapCanvasTextElement,
  actionId: RecapTextStyleActionId,
): RecapTextStyleUpdate {
  if (actionId === "bold") {
    return { fontWeight: element.fontWeight === "bold" ? "normal" : "bold" };
  }

  if (actionId === "italic") {
    return {
      fontStyle: element.fontStyle === "italic" ? "normal" : "italic",
    };
  }

  return {
    textDecorationLine:
      element.textDecorationLine === "underline" ? "none" : "underline",
  };
}

export function isRecapTextAlignmentSelected(
  element: RecapCanvasTextElement,
  actionId: RecapTextAlignmentActionId,
): boolean {
  const currentAlignment = element.textAlign ?? "left";

  return currentAlignment === actionId;
}

export function resolveRecapTextAlignmentUpdate(
  actionId: RecapTextAlignmentActionId,
): RecapTextStyleUpdate {
  return { textAlign: actionId };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
