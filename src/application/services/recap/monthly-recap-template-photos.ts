import type { DailyPhoto } from "@/application/services/daily-photo/types";
import type { MonthlyRecap } from "@/shared/recap/types";

export type MonthlyRecapTemplatePhotos = {
  backgroundPhotos: DailyPhoto[];
  calendarPhotos: DailyPhoto[];
  selectedPhotos: DailyPhoto[];
};

export function resolveMonthlyRecapTemplatePhotos({
  photos,
  recap,
}: {
  photos: DailyPhoto[];
  recap: MonthlyRecap;
}): MonthlyRecapTemplatePhotos {
  const selectedPhotos = toPhotosByIds(photos, recap.selectedPhotoIds);
  const backgroundPhotos = toPhotosByIds(photos, recap.backgroundPhotoIds);
  const calendarPhotos = toPhotosByIds(photos, recap.calendarPhotoIds);

  return {
    backgroundPhotos:
      backgroundPhotos.length > 0
        ? backgroundPhotos
        : selectedPhotos.slice(0, 1),
    calendarPhotos:
      calendarPhotos.length > 0 ? calendarPhotos : selectedPhotos.slice(0, 4),
    selectedPhotos,
  };
}

function toPhotosByIds(photos: DailyPhoto[], photoIds: string[]): DailyPhoto[] {
  const photosById = new Map(photos.map((photo) => [photo.id, photo]));

  return photoIds.flatMap((photoId) => {
    const photo = photosById.get(photoId);

    return photo ? [photo] : [];
  });
}
