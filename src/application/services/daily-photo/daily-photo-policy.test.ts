import { describe, expect, it } from "vitest";

import {
  canEditDailyPhoto,
  canOpenDailyPhotoDetail,
  isDailyPhotoLocked,
} from "@/application/services/daily-photo/daily-photo-policy";
import type { DailyPhoto } from "@/application/services/daily-photo/types";

describe("daily photo policy", () => {
  it("allows editing only today's date", () => {
    expect(canEditDailyPhoto("2026-04-09", "2026-04-09")).toBe(true);
    expect(canEditDailyPhoto("2026-04-08", "2026-04-09")).toBe(false);
    expect(canEditDailyPhoto("2026-04-10", "2026-04-09")).toBe(false);
  });

  it("opens photo detail only for today's displayable photo", () => {
    const photo = createDailyPhoto({ date: "2026-06-28" });

    expect(canOpenDailyPhotoDetail("2026-06-28", "2026-06-28", photo)).toBe(true);
    expect(canOpenDailyPhotoDetail("2026-06-26", "2026-06-28", { ...photo, date: "2026-06-26" })).toBe(false);
    expect(canOpenDailyPhotoDetail("2026-06-29", "2026-06-28", { ...photo, date: "2026-06-29" })).toBe(false);
    expect(canOpenDailyPhotoDetail("2026-06-28", "2026-06-28", { ...photo, imagePath: "" })).toBe(false);
    expect(canOpenDailyPhotoDetail("2026-06-28", "2026-06-28", null)).toBe(false);
  });

  it("detects locked photos", () => {
    const photo = createDailyPhoto({ lockedAt: "2026-04-10T00:00:00.000Z" });

    expect(isDailyPhotoLocked(photo)).toBe(true);
    expect(isDailyPhotoLocked({ ...photo, lockedAt: null })).toBe(false);
    expect(isDailyPhotoLocked(null)).toBe(false);
  });
});

function createDailyPhoto(overrides: Partial<DailyPhoto> = {}): DailyPhoto {
  return {
    id: "photo-1",
    userId: "user-1",
    date: "2026-04-09",
    imagePath: "file://photo.jpg",
    localImagePath: "file://photo.jpg",
    remoteImageUrl: null,
    storageKey: "user-1/2026-04-09.jpg",
    syncStatus: "local",
    createdAt: "2026-04-09T00:00:00.000Z",
    updatedAt: "2026-04-09T00:00:00.000Z",
    lockedAt: null,
    ...overrides,
  };
}
