import { describe, expect, it } from "vitest";

import {
  canEditDailyPhoto,
  canOpenDailyPhotoDetail,
  getDailyPhotoSelectionAction,
  isDailyPhotoLocked,
} from "@/application/services/daily-photo/daily-photo-policy";
import type { DailyPhoto } from "@/application/services/daily-photo/types";

describe("daily photo policy", () => {
  it("allows editing only today's date", () => {
    expect(canEditDailyPhoto("2026-04-09", "2026-04-09")).toBe(true);
    expect(canEditDailyPhoto("2026-04-08", "2026-04-09")).toBe(false);
    expect(canEditDailyPhoto("2026-04-10", "2026-04-09")).toBe(false);
  });

  it("opens photo detail for displayable photos up to today's date", () => {
    const photo = createDailyPhoto({ date: "2026-06-29" });

    expect(canOpenDailyPhotoDetail("2026-06-29", "2026-06-29", photo)).toBe(
      true,
    );
    expect(
      canOpenDailyPhotoDetail("2026-06-27", "2026-06-29", {
        ...photo,
        date: "2026-06-27",
      }),
    ).toBe(true);
    expect(
      canOpenDailyPhotoDetail("2026-06-30", "2026-06-29", {
        ...photo,
        date: "2026-06-30",
      }),
    ).toBe(false);
    expect(
      canOpenDailyPhotoDetail("2026-06-29", "2026-06-29", {
        ...photo,
        imagePath: "",
      }),
    ).toBe(false);
    expect(canOpenDailyPhotoDetail("2026-06-29", "2026-06-29", null)).toBe(
      false,
    );
  });

  it("resolves the calendar tap action from the date and photo state", () => {
    const todayPhoto = createDailyPhoto({ date: "2026-06-29" });
    const pastPhoto = createDailyPhoto({ date: "2026-06-27" });
    const futurePhoto = createDailyPhoto({ date: "2026-06-30" });

    expect(getDailyPhotoSelectionAction("2026-06-30", "2026-06-29", null)).toBe(
      "showUnavailable",
    );
    expect(
      getDailyPhotoSelectionAction("2026-06-30", "2026-06-29", futurePhoto),
    ).toBe("showUnavailable");
    expect(getDailyPhotoSelectionAction("2026-06-29", "2026-06-29", null)).toBe(
      "openPicker",
    );
    expect(
      getDailyPhotoSelectionAction("2026-06-29", "2026-06-29", todayPhoto),
    ).toBe("openDetail");
    expect(getDailyPhotoSelectionAction("2026-06-27", "2026-06-29", null)).toBe(
      "showUnavailable",
    );
    expect(
      getDailyPhotoSelectionAction("2026-06-27", "2026-06-29", pastPhoto),
    ).toBe("openDetail");
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
