import { Image as ExpoImage } from "expo-image";
import { Image as NativeImage } from "react-native";

export type ImageDimensions = {
  height: number;
  width: number;
};

export async function loadImageDimensions(
  imagePath: string,
): Promise<ImageDimensions | null> {
  const nativeDimensions = await loadNativeImageDimensions(imagePath);

  if (nativeDimensions) {
    return nativeDimensions;
  }

  try {
    const image = await ExpoImage.loadAsync({ uri: imagePath });

    return hasValidDimensions(image) ? image : null;
  } catch {
    return null;
  }
}

function loadNativeImageDimensions(
  imagePath: string,
): Promise<ImageDimensions | null> {
  return new Promise((resolve) => {
    NativeImage.getSize(
      imagePath,
      (width, height) => {
        const dimensions = { height, width };

        resolve(hasValidDimensions(dimensions) ? dimensions : null);
      },
      () => resolve(null),
    );
  });
}

function hasValidDimensions(dimensions: ImageDimensions) {
  return (
    Number.isFinite(dimensions.width) &&
    Number.isFinite(dimensions.height) &&
    dimensions.width > 0 &&
    dimensions.height > 0
  );
}
