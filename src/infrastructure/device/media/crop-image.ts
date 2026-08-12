import ImageCropPicker from "react-native-image-crop-picker";

export type CropImageResult = {
  height: number;
  uri: string;
  width: number;
};

export async function cropImage(
  imagePath: string,
): Promise<CropImageResult | null> {
  try {
    const result = await ImageCropPicker.openCropper({
      avoidEmptySpaceAroundImage: true,
      freeStyleCropEnabled: true,
      mediaType: "photo",
      path: imagePath,
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
