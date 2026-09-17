import { isDefaultRecapCanvasBackgroundColor } from "@/application/services/recap/recap-canvas-background";
import type { MonthlyRecapCanvasDraft } from "@/shared/recap/types";

type RecapCanvasContent = Pick<
  MonthlyRecapCanvasDraft,
  "aspectRatio" | "backgroundColor" | "elements" | "layout"
>;

export function hasRecapCanvasContent(
  canvas: RecapCanvasContent | null,
): boolean {
  return Boolean(
    canvas?.layout ||
    canvas?.elements.length ||
    (canvas && !isDefaultRecapCanvasBackgroundColor(canvas.backgroundColor)),
  );
}
