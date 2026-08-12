import {
  createRecapStickerElement,
  createRecapWidgetElement,
} from "@/application/services/recap/recap-canvas-elements";
import type { StickerAsset } from "@/application/services/stickers/types";
import type {
  RecapCanvasStickerElement,
  RecapCanvasWidgetElement,
} from "@/shared/recap/types";

type CreateRecapCanvasAssetInsertionOptions = {
  asset: StickerAsset;
  id: string;
  x: number;
  y: number;
  zIndex: number;
};

export type RecapCanvasAssetInsertion = {
  element: RecapCanvasStickerElement | RecapCanvasWidgetElement;
  shouldClosePicker: boolean;
  shouldStartWidgetEditing: boolean;
};

export function createRecapCanvasAssetInsertion(
  options: CreateRecapCanvasAssetInsertionOptions,
): RecapCanvasAssetInsertion {
  const { asset, id, x, y, zIndex } = options;
  const position = { x, y, zIndex };

  if (asset.source === "sticker") {
    return {
      element: createRecapStickerElement({
        id,
        stickerAssetId: asset.id,
        ...position,
      }),
      shouldClosePicker: false,
      shouldStartWidgetEditing: false,
    };
  }

  const element = createRecapWidgetElement({
    id,
    variant: asset.variant,
    ...position,
  });
  const shouldStartWidgetEditing = asset.variant === "speechBubble";

  return {
    element,
    shouldClosePicker: shouldStartWidgetEditing,
    shouldStartWidgetEditing,
  };
}
