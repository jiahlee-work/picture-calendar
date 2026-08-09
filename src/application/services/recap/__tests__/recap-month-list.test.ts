import { describe, expect, it } from "vitest";

import {
  canCreateRecapForMonth,
  createRecapMonthSummaries,
  RecapAvailabilityMode,
  RecapMonthStatus,
} from "@/application/services/recap/recap-month-list";
import type { DailyPhoto } from "@/shared/daily-photo/types";

const photos: DailyPhoto[] = [
  {
    createdAt: "2026-06-02T09:00:00.000Z",
    date: "2026-06-02",
    id: "photo-1",
    imagePath: "file://photo-1",
    localImagePath: "file://photo-1",
    lockedAt: null,
    remoteImageUrl: null,
    storageKey: "photo-1",
    syncStatus: "local",
    updatedAt: "2026-06-02T09:00:00.000Z",
    userId: "user-1",
  },
];

describe("recap month list", () => {
  it("summarizes photos without requiring a generated recap", async () => {
    const months = await createRecapMonthSummaries({
      availabilityMode: RecapAvailabilityMode.development,
      currentDate: new Date("2026-07-15T12:00:00Z"),
      repository: {
        deleteByDate: async () => null,
        hasAny: async () => photos.length > 0,
        listByMonth: async (_userId, month) =>
          month === "2026-06" ? photos : [],
        saveToday: async () => photos[0] ?? null,
      },
      startMonth: "2026-06",
      userId: "user-1",
      year: 2026,
    });

    const june = months.find((month) => month.month === "2026-06");
    expect(june).toMatchObject({
      photoCount: 1,
      previewPhotos: photos,
      status: RecapMonthStatus.ready,
    });
  });

  it("does not make the current month available in production", () => {
    expect(
      canCreateRecapForMonth({
        availabilityMode: RecapAvailabilityMode.production,
        currentDate: new Date("2026-07-15T12:00:00Z"),
        month: "2026-07",
      }),
    ).toBe(false);
  });
});
