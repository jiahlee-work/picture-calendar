import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { isDisplayableDailyPhoto } from "@/application/services/daily-photo/daily-photo-records";

export type DailyPhotoSelectionAction =
  "openDetail" | "openPicker" | "showUnavailable";

export const dailyPhotoMessages = {
  saveFailed: "사진을 저장하지 못했어요. 잠시 후 다시 시도해주세요.",
  unavailable: "과거·미래 날짜에는 사진을 추가할 수 없어요.",
} as const;

export function canEditDailyPhoto(dateKey: string, todayKey: string): boolean {
  return dateKey === todayKey;
}

export function canOpenDailyPhotoDetail(
  dateKey: string,
  todayKey: string,
  photo: DailyPhoto | null,
): boolean {
  return dateKey <= todayKey && isDisplayableDailyPhoto(photo);
}

export function getDailyPhotoSelectionAction(
  dateKey: string,
  todayKey: string,
  photo: DailyPhoto | null,
): DailyPhotoSelectionAction {
  if (canOpenDailyPhotoDetail(dateKey, todayKey, photo)) {
    return "openDetail";
  }

  if (canEditDailyPhoto(dateKey, todayKey)) {
    return "openPicker";
  }

  return "showUnavailable";
}

export function isDailyPhotoLocked(photo: DailyPhoto | null): boolean {
  return Boolean(photo?.lockedAt);
}
