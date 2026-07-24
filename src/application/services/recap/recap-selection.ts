export const MONTHLY_RECAP_SELECTION_LIMIT = 10;

export function applyMonthlyRecapSelectionLimit(
  selectedPhotoIds: string[],
  limit = MONTHLY_RECAP_SELECTION_LIMIT,
): string[] {
  return Array.from(new Set(selectedPhotoIds)).slice(0, limit);
}

export function toggleMonthlyRecapSelectedPhotoId(
  selectedPhotoIds: string[],
  photoId: string,
  limit = MONTHLY_RECAP_SELECTION_LIMIT,
): string[] {
  if (selectedPhotoIds.includes(photoId)) {
    return selectedPhotoIds.filter((selectedPhotoId) => selectedPhotoId !== photoId);
  }

  if (selectedPhotoIds.length >= limit) {
    return selectedPhotoIds;
  }

  return [...selectedPhotoIds, photoId];
}
