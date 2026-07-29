import { describe, expect, it } from "vitest";

import { listStickerAssets } from "@/application/services/stickers/sticker-assets";
import type { StickerRepository } from "@/application/services/stickers/types";

describe("listStickerAssets", () => {
  it("places built-in assets before the current user's assets", async () => {
    const repository = createStickerRepository();

    await expect(
      listStickerAssets(repository, "user-1"),
    ).resolves.toMatchObject([
      { id: "built-in-calendar", source: "builtIn", variant: "calendar" },
      {
        id: "built-in-polaroid-frame",
        source: "builtIn",
        variant: "polaroidFrame",
      },
      { id: "user-sticker", source: "user", userId: "user-1" },
    ]);
  });
});

function createStickerRepository(): StickerRepository {
  return {
    async listUserAssets(userId) {
      return [
        {
          id: "user-sticker",
          source: "user",
          userId,
          imagePath: "file://sticker.png",
          storageKey: "user-1/sticker.png",
          createdAt: "2026-06-01T00:00:00.000Z",
        },
      ];
    },
    async saveUserAsset() {
      throw new Error("Not implemented");
    },
    async updateUserAsset() {
      throw new Error("Not implemented");
    },
    async deleteUserAsset() {
      throw new Error("Not implemented");
    },
  };
}
