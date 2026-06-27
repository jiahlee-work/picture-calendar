import type { DailyPhoto } from "@/application/services/daily-photo/types";

export function toPhotosByDate(photos: DailyPhoto[]): Record<string, DailyPhoto> {
  return Object.fromEntries(photos.map((photo) => [photo.date, photo]));
}

export function isDisplayableDailyPhoto(photo: DailyPhoto | null) {
  return Boolean(photo?.imagePath);
}

export function isDevelopmentSampleStorageKey(storageKey: string) {
  return storageKey.startsWith("development/");
}
