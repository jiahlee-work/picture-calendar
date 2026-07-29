import { describe, expect, it } from "vitest";

import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { resolveMonthlyRecapTemplatePhotos } from "@/application/services/recap/monthly-recap-template-photos";
import type { MonthlyRecap } from "@/shared/recap/types";

describe("resolveMonthlyRecapTemplatePhotos", () => {
  it.each([4, 5, 6, 7, 8, 9])(
    "keeps all stored calendar photos for a %i-photo automatic recap",
    (photoCount) => {
      const photoIds = createPhotoIds(photoCount);
      const [backgroundPhotoId, ...calendarPhotoIds] = photoIds;
      const photos = createPhotos(photoIds);
      const recap = createRecap({
        backgroundPhotoIds: [backgroundPhotoId],
        calendarPhotoIds,
        selectedPhotoIds: photoIds,
      });

      const resolvedPhotos = resolveMonthlyRecapTemplatePhotos({
        photos,
        recap,
      });

      expect(resolvedPhotos.backgroundPhotos.map((photo) => photo.id)).toEqual([
        backgroundPhotoId,
      ]);
      expect(resolvedPhotos.calendarPhotos.map((photo) => photo.id)).toEqual(
        calendarPhotoIds,
      );
      expect([
        ...resolvedPhotos.backgroundPhotos.map((photo) => photo.id),
        ...resolvedPhotos.calendarPhotos.map((photo) => photo.id),
      ]).toHaveLength(photoCount);
    },
  );

  it("uses the stored layout instead of choosing a new background", () => {
    const photos = createPhotos(["photo-1", "photo-2", "photo-3", "photo-4"]);
    const recap = createRecap({
      backgroundPhotoIds: ["photo-4"],
      calendarPhotoIds: ["photo-1", "photo-2", "photo-3"],
      selectedPhotoIds: ["photo-1", "photo-2", "photo-3", "photo-4"],
    });

    const firstResolvedPhotos = resolveMonthlyRecapTemplatePhotos({
      photos,
      recap,
    });
    const secondResolvedPhotos = resolveMonthlyRecapTemplatePhotos({
      photos,
      recap,
    });

    expect(
      firstResolvedPhotos.backgroundPhotos.map((photo) => photo.id),
    ).toEqual(["photo-4"]);
    expect(
      secondResolvedPhotos.backgroundPhotos.map((photo) => photo.id),
    ).toEqual(["photo-4"]);
  });
});

function createPhotoIds(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `photo-${index + 1}`);
}

function createPhotos(photoIds: string[]): DailyPhoto[] {
  return photoIds.map((photoId, index) => ({
    id: photoId,
    userId: "user-1",
    date: `2026-06-${String(index + 1).padStart(2, "0")}`,
    imagePath: `file://${photoId}.jpg`,
    localImagePath: `file://${photoId}.jpg`,
    remoteImageUrl: null,
    storageKey: null,
    syncStatus: "local",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    lockedAt: null,
  }));
}

function createRecap({
  backgroundPhotoIds,
  calendarPhotoIds,
  selectedPhotoIds,
}: {
  backgroundPhotoIds: string[];
  calendarPhotoIds: string[];
  selectedPhotoIds: string[];
}): MonthlyRecap {
  return {
    id: "local-recap-2026-06",
    userId: "user-1",
    month: "2026-06",
    selectedPhotoIds,
    templateId: "calendar_collage",
    calendarPhotoIds,
    backgroundPhotoIds,
    selectionStatus: "selected",
    promptedAt: null,
    completedAt: "2026-06-01T00:00:00.000Z",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  };
}
