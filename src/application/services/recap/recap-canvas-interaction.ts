export const RECAP_CANVAS_DOUBLE_TAP_DELAY_MS = 280;

export function resolveRecapCanvasTap(
  lastTapAt: number,
  tappedAt: number,
): { nextLastTapAt: number; shouldStartEditing: boolean } {
  const elapsedTime = tappedAt - lastTapAt;
  const shouldStartEditing =
    lastTapAt > 0 &&
    elapsedTime >= 0 &&
    elapsedTime <= RECAP_CANVAS_DOUBLE_TAP_DELAY_MS;

  return {
    nextLastTapAt: shouldStartEditing ? 0 : tappedAt,
    shouldStartEditing,
  };
}
