import { describe, expect, it } from "vitest";

import {
  loadMonthlyRecapDetail,
  MonthlyRecapDetailStatus,
} from "@/application/services/recap/monthly-recap-detail";
import { RecapAvailabilityMode } from "@/application/services/recap/recap-month-list";
import type { DailyPhotoRepository } from "@/application/services/daily-photo/types";
import type { DailyPhoto } from "@/shared/daily-photo/types";

const photos: DailyPhoto[] = [
  createPhoto("photo-2", "2026-06-02"),
  createPhoto("photo-1", "2026-06-01"),
];
const createRepository = (
  monthPhotos: typeof photos,
): DailyPhotoRepository => ({
  deleteByDate: async () => null,
  hasAny: async () => monthPhotos.length > 0,
  listByMonth: async () => monthPhotos,
  saveToday: async () => monthPhotos[0] ?? null,
});

function createPhoto(id: string, date: string): DailyPhoto {
  return {
    createdAt: `${date}T09:00:00.000Z`,
    date,
    id,
    imagePath: `file://${id}`,
    localImagePath: `file://${id}`,
    lockedAt: null,
    remoteImageUrl: null,
    storageKey: id,
    syncStatus: "local",
    updatedAt: `${date}T09:00:00.000Z`,
    userId: "user-1",
  };
}

describe("loadMonthlyRecapDetail", () => {
  it("returns all month photos when the recap is available", async () => {
    const result = await loadMonthlyRecapDetail({
      currentDate: new Date("2026-07-01T12:00:00Z"),
      dailyPhotoRepository: createRepository(photos),
      month: "2026-06",
      userId: "user-1",
    });

    expect(result.status).toBe(MonthlyRecapDetailStatus.ready);
    expect(result.photos.map((photo) => photo.id)).toEqual([
      "photo-1",
      "photo-2",
    ]);
  });

  it("reports an empty month", async () => {
    const result = await loadMonthlyRecapDetail({
      dailyPhotoRepository: createRepository([]),
      month: "2026-06",
      userId: "user-1",
    });

    expect(result.status).toBe(MonthlyRecapDetailStatus.empty);
  });

  it("reports the current month as collecting in production", async () => {
    const result = await loadMonthlyRecapDetail({
      availabilityMode: RecapAvailabilityMode.production,
      currentDate: new Date("2026-06-15T12:00:00Z"),
      dailyPhotoRepository: createRepository(photos),
      month: "2026-06",
      userId: "user-1",
    });

    expect(result.status).toBe(MonthlyRecapDetailStatus.collecting);
  });
});
