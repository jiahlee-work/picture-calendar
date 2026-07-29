import type { DailyPhoto } from "@/shared/daily-photo/types";

export function applyCurrentDailyPhotoFileUri(
  photo: DailyPhoto,
  currentFileUri: string | null,
): DailyPhoto {
  if (!photo.storageKey || !currentFileUri) {
    return photo;
  }

  if (
    photo.imagePath === currentFileUri &&
    photo.localImagePath === currentFileUri
  ) {
    return photo;
  }

  return {
    ...photo,
    imagePath: currentFileUri,
    localImagePath: currentFileUri,
  };
}
