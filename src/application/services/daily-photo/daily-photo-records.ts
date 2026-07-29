import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { isLegacyDevelopmentDailyPhoto as isLegacyDevelopmentDailyPhotoRecord } from "@/infrastructure/persistence/daily-photo/legacy-development-photo";

export function toPhotosByDate(
  photos: DailyPhoto[],
): Record<string, DailyPhoto> {
  return Object.fromEntries(photos.map((photo) => [photo.date, photo]));
}

export function isDisplayableDailyPhoto(
  photo: DailyPhoto | null,
): photo is DailyPhoto {
  return Boolean(photo?.imagePath);
}

export function isLegacyDevelopmentDailyPhoto(photo: DailyPhoto): boolean {
  return isLegacyDevelopmentDailyPhotoRecord(photo);
}
