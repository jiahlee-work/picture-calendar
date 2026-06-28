import { isDisplayableDailyPhoto } from "@/application/services/daily-photo/daily-photo-records";
import type { DailyPhoto } from "@/application/services/daily-photo/types";

export function isRecapMonthPhoto(photo: DailyPhoto): boolean {
  return isDisplayableDailyPhoto(photo);
}

export function sortRecapMonthPhotos(photos: DailyPhoto[]): DailyPhoto[] {
  return [...photos].filter(isRecapMonthPhoto).sort((firstPhoto, secondPhoto) => firstPhoto.date.localeCompare(secondPhoto.date));
}
