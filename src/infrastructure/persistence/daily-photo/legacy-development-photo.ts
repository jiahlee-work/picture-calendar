import type { DailyPhoto } from "@/shared/daily-photo/types";

export function isLegacyDevelopmentDailyPhoto(photo: DailyPhoto): boolean {
  return (
    photo.storageKey?.startsWith("development/") === true ||
    photo.imagePath.includes("/PicalSamples/")
  );
}
