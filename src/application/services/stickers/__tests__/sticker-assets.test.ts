import { describe, expect, it } from "vitest";

import { listStickerAssets } from "@/application/services/stickers/sticker-assets";
import type { StickerRepository } from "@/application/services/stickers/types";

describe("listStickerAssets", () => {
  it("places widget assets before the current user's assets", async () => {
    const repository = createStickerRepository();

    await expect(
      listStickerAssets(repository, "user-1"),
    ).resolves.toMatchObject([
      { id: "widget-calendar", source: "widget", variant: "calendar" },
      {
        id: "widget-polaroid-frame",
        source: "widget",
        variant: "polaroidFrame",
      },
      {
        id: "widget-polaroid-frame-portrait",
        source: "widget",
        variant: "polaroidFramePortrait",
      },
      {
        id: "widget-speech-bubble",
        source: "widget",
        variant: "speechBubble",
      },
      { id: "user-sticker", source: "sticker", userId: "user-1" },
    ]);
  });
});

function createStickerRepository(): StickerRepository {
  return {
    async listUserAssets(userId) {
      return [
        {
          id: "user-sticker",
          source: "sticker",
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
