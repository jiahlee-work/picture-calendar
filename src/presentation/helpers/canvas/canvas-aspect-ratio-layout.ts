import {
  RecapCanvasAspectRatio,
  type RecapCanvasAspectRatio as RecapCanvasAspectRatioType,
} from "@/shared/recap/types";

export type CanvasDimensions = {
  height: number;
  width: number;
};

export function getCanvasDimensions(
  aspectRatio: RecapCanvasAspectRatioType,
  bounds: CanvasDimensions,
): CanvasDimensions {
  if (aspectRatio === RecapCanvasAspectRatio.device) {
    return bounds;
  }

  const ratio =
    aspectRatio === RecapCanvasAspectRatio.portraitFourFive ? 4 / 5 : 9 / 16;
  const width = Math.min(bounds.width, bounds.height * ratio);

  return {
    height: Math.round(width / ratio),
    width: Math.round(width),
  };
}
