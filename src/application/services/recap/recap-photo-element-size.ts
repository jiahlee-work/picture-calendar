import { getRecapPhotoElementSize } from "@/application/services/recap/recap-canvas-elements";
import { loadImageDimensions } from "@/infrastructure/device/media/load-image-dimensions";

export async function loadRecapPhotoElementSize(imagePath: string) {
  const dimensions = await loadImageDimensions(imagePath);

  return dimensions
    ? getRecapPhotoElementSize(dimensions.width, dimensions.height)
    : null;
}
