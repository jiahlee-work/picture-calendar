import { describe, expect, it } from "vitest";

import { isDisplayableDailyPhoto, toPhotosByDate } from "@/application/services/daily-photo/daily-photo-records";
import type { DailyPhoto } from "@/application/services/daily-photo/types";

describe("daily photo records", () => {
  it("indexes photos by date", () => {
    const firstPhoto = createDailyPhoto({ date: "2026-06-01", imagePath: "file://1.jpg" });
    const secondPhoto = createDailyPhoto({ date: "2026-06-02", imagePath: "file://2.jpg" });

    expect(toPhotosByDate([firstPhoto, secondPhoto])).toEqual({
      "2026-06-01": firstPhoto,
      "2026-06-02": secondPhoto,
    });
  });

  it("detects photos that can be displayed", () => {
    expect(isDisplayableDailyPhoto(createDailyPhoto({ imagePath: "file://photo.jpg" }))).toBe(true);
    expect(isDisplayableDailyPhoto(createDailyPhoto({ imagePath: "" }))).toBe(false);
    expect(isDisplayableDailyPhoto(null)).toBe(false);
  });
});

function createDailyPhoto(overrides: Partial<DailyPhoto> = {}): DailyPhoto {
  return {
    id: "photo-1",
    userId: "user-1",
    date: "2026-06-01",
    imagePath: "file://photo.jpg",
    localImagePath: "file://photo.jpg",
    remoteImageUrl: null,
    storageKey: null,
    syncStatus: "local",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    lockedAt: null,
    ...overrides,
  };
}
