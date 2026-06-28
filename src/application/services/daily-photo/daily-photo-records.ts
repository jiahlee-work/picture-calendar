import type { DailyPhoto } from "@/application/services/daily-photo/types";

export function toPhotosByDate(photos: DailyPhoto[]): Record<string, DailyPhoto> {
  return Object.fromEntries(photos.map((photo) => [photo.date, photo]));
}

export function isDisplayableDailyPhoto(photo: DailyPhoto | null): photo is DailyPhoto {
  return Boolean(photo?.imagePath);
}
