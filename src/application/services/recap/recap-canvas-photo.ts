import {
  createRecapPhotoElement,
  getNextRecapCanvasElementZIndex,
  upsertRecapCanvasElement,
} from "@/application/services/recap/recap-canvas-elements";
import type { RecapCanvasElement } from "@/shared/recap/types";

export type MeasuredRecapPhoto = {
  height: number;
  photoId: string;
  width: number;
};

type InsertRecapCanvasPhotoElementsOptions = {
  canvasHeight: number;
  canvasWidth: number;
  elements: RecapCanvasElement[];
  elementIdPrefix: string;
  photos: MeasuredRecapPhoto[];
};

const RECAP_PHOTO_MINIMUM_X = 24;
const RECAP_PHOTO_MINIMUM_Y = 120;
const RECAP_PHOTO_STACK_OFFSET = 24;

export function insertRecapCanvasPhotoElements(
  options: InsertRecapCanvasPhotoElementsOptions,
) {
  const { canvasHeight, canvasWidth, elementIdPrefix, photos } = options;

  return photos.reduce((elements, photo, index) => {
    const element = createRecapPhotoElement({
      height: photo.height,
      id: `${elementIdPrefix}-${index}`,
      photoId: photo.photoId,
      width: photo.width,
      x: Math.max(
        Math.round(canvasWidth / 2 - photo.width / 2),
        RECAP_PHOTO_MINIMUM_X,
      ),
      y: Math.max(
        Math.round(
          canvasHeight / 2 -
            photo.height / 2 +
            index * RECAP_PHOTO_STACK_OFFSET,
        ),
        RECAP_PHOTO_MINIMUM_Y,
      ),
      zIndex: getNextRecapCanvasElementZIndex(elements),
    });

    return upsertRecapCanvasElement(elements, element);
  }, options.elements);
}
