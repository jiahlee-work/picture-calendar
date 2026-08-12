export const DEFAULT_RECAP_CANVAS_BACKGROUND_COLOR = "#ffffff";

const SHORT_HEX_COLOR_PATTERN = /^#([0-9a-f]{3})$/i;
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export function normalizeRecapCanvasBackgroundColor(
  color: string | null | undefined,
): string {
  const trimmedColor = color?.trim();

  if (!trimmedColor) {
    return DEFAULT_RECAP_CANVAS_BACKGROUND_COLOR;
  }

  const shortHexMatch = SHORT_HEX_COLOR_PATTERN.exec(trimmedColor);

  if (shortHexMatch) {
    return `#${shortHexMatch[1]
      .split("")
      .map((character) => character.repeat(2))
      .join("")}`.toLowerCase();
  }

  if (HEX_COLOR_PATTERN.test(trimmedColor)) {
    return trimmedColor.toLowerCase();
  }

  return DEFAULT_RECAP_CANVAS_BACKGROUND_COLOR;
}

export function isDefaultRecapCanvasBackgroundColor(
  color: string | null | undefined,
): boolean {
  return (
    normalizeRecapCanvasBackgroundColor(color) ===
    DEFAULT_RECAP_CANVAS_BACKGROUND_COLOR
  );
}
