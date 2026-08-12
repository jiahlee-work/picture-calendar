import type {
  RecapCanvasBaseElement,
  RecapCanvasTextElement,
} from "@/shared/recap/types";

export function parseRecapCanvasTextMetadata(
  value: Record<string, unknown>,
  base: RecapCanvasBaseElement,
): RecapCanvasTextElement | null {
  const content = stringValue(value.content);
  const color = stringValue(value.color);
  const fontSize = numberValue(value.fontSize);

  if (content === null || !color || fontSize === null) {
    return null;
  }

  return {
    ...base,
    color,
    content,
    fontFamily: stringValue(value.fontFamily) ?? undefined,
    fontSize,
    fontStyle: fontStyleValue(value.fontStyle),
    fontWeight: fontWeightValue(value.fontWeight),
    textAlign: textAlignValue(value.textAlign),
    textDecorationLine: textDecorationLineValue(value.textDecorationLine),
    type: "text",
    width: positiveNumberValue(value.width) ?? undefined,
  };
}

function positiveNumberValue(value: unknown): number | null {
  const number = numberValue(value);

  return number !== null && number > 0 ? number : null;
}

function fontStyleValue(value: unknown) {
  return value === "italic" || value === "normal" ? value : undefined;
}

function fontWeightValue(value: unknown) {
  return value === "bold" || value === "normal" ? value : undefined;
}

function textAlignValue(value: unknown) {
  return value === "center" || value === "left" || value === "right"
    ? value
    : undefined;
}

function textDecorationLineValue(value: unknown) {
  return value === "none" || value === "underline" ? value : undefined;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
