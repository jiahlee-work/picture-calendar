import { describe, expect, it } from "vitest";

import { applyCurrentDailyPhotoFileUri } from "@/infrastructure/persistence/daily-photo/daily-photo-file-uri";
import type { DailyPhoto } from "@/shared/daily-photo/types";

describe("applyCurrentDailyPhotoFileUri", () => {
  it("repairs local file URIs when the app container path changed", () => {
    const photo = createDailyPhoto({
      imagePath: "file:///old-container/Documents/daily-photos/local-user/2026-06-30.jpg",
      localImagePath: "file:///old-container/Documents/daily-photos/local-user/2026-06-30.jpg",
      storageKey: "local-user/2026-06-30.jpg",
    });

    expect(applyCurrentDailyPhotoFileUri(photo, "file:///current-container/Documents/daily-photos/local-user/2026-06-30.jpg"))
      .toMatchObject({
        imagePath: "file:///current-container/Documents/daily-photos/local-user/2026-06-30.jpg",
        localImagePath: "file:///current-container/Documents/daily-photos/local-user/2026-06-30.jpg",
      });
  });

  it("keeps photos without a local storage key unchanged", () => {
    const photo = createDailyPhoto({
      imagePath: "file:///old-container/photo.jpg",
      localImagePath: "file:///old-container/photo.jpg",
      storageKey: null,
    });

    expect(applyCurrentDailyPhotoFileUri(photo, "file:///current-container/photo.jpg")).toBe(photo);
  });
});

function createDailyPhoto(overrides: Partial<DailyPhoto> = {}): DailyPhoto {
  return {
    id: "photo-1",
    userId: "local-user",
    date: "2026-06-30",
    imagePath: "file:///photo.jpg",
    localImagePath: "file:///photo.jpg",
    remoteImageUrl: null,
    storageKey: "local-user/2026-06-30.jpg",
    syncStatus: "local",
    createdAt: "2026-06-30T00:00:00.000Z",
    updatedAt: "2026-06-30T00:00:00.000Z",
    lockedAt: null,
    ...overrides,
  };
}
