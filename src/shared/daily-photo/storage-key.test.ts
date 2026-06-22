import { describe, expect, it } from "vitest";

import {
  imageFileExtensionFromFileName,
  imageFileExtensionFromMimeType,
  normalizeImageFileExtension,
  sanitizeStoragePathSegment,
  toDailyPhotoStorageKey,
} from "@/shared/daily-photo/storage-key";

describe("daily photo storage key", () => {
  it("builds a stable user/date file key", () => {
    expect(toDailyPhotoStorageKey({ userId: "user-1", date: "2026-06-22", extension: ".png" })).toBe("user-1/2026-06-22.png");
  });

  it("can include a revision to avoid stale local image caches", () => {
    expect(toDailyPhotoStorageKey({ userId: "user-1", date: "2026-06-22", extension: ".jpg", revision: "abc 123" })).toBe(
      "user-1/2026-06-22-abc_123.jpg",
    );
  });

  it("sanitizes path segments", () => {
    expect(sanitizeStoragePathSegment("local user/@1")).toBe("local_user_1");
    expect(sanitizeStoragePathSegment("   ")).toBe("user");
  });

  it("normalizes image extensions", () => {
    expect(normalizeImageFileExtension("jpeg")).toBe(".jpg");
    expect(normalizeImageFileExtension(".PNG?cache=1")).toBe(".png");
    expect(normalizeImageFileExtension(null)).toBe(".jpg");
    expect(normalizeImageFileExtension("../bad")).toBe(".jpg");
  });

  it("derives image extensions from picker metadata", () => {
    expect(imageFileExtensionFromMimeType("image/jpeg")).toBe(".jpg");
    expect(imageFileExtensionFromMimeType("image/png")).toBe(".png");
    expect(imageFileExtensionFromMimeType("application/octet-stream")).toBeNull();
    expect(imageFileExtensionFromFileName("photo.HEIC")).toBe(".HEIC");
    expect(imageFileExtensionFromFileName("photo")).toBeNull();
  });
});
