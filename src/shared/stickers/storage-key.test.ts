import { describe, expect, it } from "vitest";

import { toStickerStorageKey } from "@/shared/stickers/storage-key";

describe("sticker storage key", () => {
  it("builds a user scoped sticker file key", () => {
    expect(
      toStickerStorageKey({
        userId: "user-1",
        revision: "abc123",
        extension: ".png",
      }),
    ).toBe("user-1/sticker-abc123.png");
  });

  it("sanitizes path segments and normalizes image extensions", () => {
    expect(
      toStickerStorageKey({
        userId: "local user/@1",
        revision: "abc 123",
        extension: "jpeg",
      }),
    ).toBe("local_user_1/sticker-abc_123.jpg");
  });
});
