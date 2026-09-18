import ImageCropPicker from "react-native-image-crop-picker";

import { loadImageDimensions } from "@/infrastructure/device/media/load-image-dimensions";

export type CropImageResult = {
  height: number;
  uri: string;
  width: number;
};

export async function cropImage(
  imagePath: string,
): Promise<CropImageResult | null> {
  try {
    const dimensions = await loadImageDimensions(imagePath);

    if (!dimensions) {
      throw new Error("Unable to load image dimensions before cropping.");
    }

    const result = await ImageCropPicker.openCropper({
      avoidEmptySpaceAroundImage: true,
      compressImageQuality: 1,
      freeStyleCropEnabled: true,
      height: Math.round(dimensions.height),
      mediaType: "photo",
      path: imagePath,
      width: Math.round(dimensions.width),
    });

    return {
      height: result.height,
      uri: result.path,
      width: result.width,
    };
  } catch (error) {
    if (isCropCancellation(error)) {
      return null;
    }

    throw error;
  }
}

function isCropCancellation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "E_PICKER_CANCELLED"
  );
}
