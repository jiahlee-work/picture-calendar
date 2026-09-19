import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { isDisplayableDailyPhoto } from "@/application/services/daily-photo/daily-photo-records";
import { translate } from "@/application/services/localization/app-i18n";

export type DailyPhotoSelectionAction =
  "openDetail" | "openPicker" | "showUnavailable";

export const dailyPhotoMessages = {
  get saveFailed() {
    return translate("photo.saveFailedMessage");
  },
  get unavailable() {
    return translate("photo.unavailableMessage");
  },
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
