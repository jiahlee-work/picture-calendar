export const monthlyRecapSelectionLimit = 10;

export function applyMonthlyRecapSelectionLimit(
  selectedPhotoIds: string[],
  limit = monthlyRecapSelectionLimit,
): string[] {
  return Array.from(new Set(selectedPhotoIds)).slice(0, limit);
}

export function toggleMonthlyRecapSelectedPhotoId(
  selectedPhotoIds: string[],
  photoId: string,
  limit = monthlyRecapSelectionLimit,
): string[] {
  if (selectedPhotoIds.includes(photoId)) {
    return selectedPhotoIds.filter((selectedPhotoId) => selectedPhotoId !== photoId);
  }

  if (selectedPhotoIds.length >= limit) {
    return selectedPhotoIds;
  }

  return [...selectedPhotoIds, photoId];
}
