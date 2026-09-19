import { describe, expect, it } from "vitest";

import {
  listStickerAssets,
  partitionStickerAssets,
  prependUserStickerAsset,
  WIDGET_ASSETS,
} from "@/application/services/stickers/sticker-assets";
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

describe("partitionStickerAssets", () => {
  it("separates widgets from user stickers while preserving their order", () => {
    const userSticker = {
      id: "user-sticker",
      source: "sticker" as const,
      userId: "user-1",
      imagePath: "file://sticker.png",
      storageKey: "user-1/sticker.png",
      createdAt: "2026-06-01T00:00:00.000Z",
    };

    expect(
      partitionStickerAssets([WIDGET_ASSETS[1], userSticker, WIDGET_ASSETS[0]]),
    ).toEqual({
      stickers: [userSticker],
      widgets: [WIDGET_ASSETS[1], WIDGET_ASSETS[0]],
    });
  });
});

describe("prependUserStickerAsset", () => {
  it("adds the new sticker before existing stickers without replacing them", () => {
    const existingSticker = {
      id: "existing-sticker",
      source: "sticker" as const,
      userId: "user-1",
      imagePath: "file://existing.png",
      storageKey: "user-1/existing.png",
      createdAt: "2026-06-01T00:00:00.000Z",
    };
    const newSticker = {
      ...existingSticker,
      id: "new-sticker",
      imagePath: "file://new.png",
      storageKey: "user-1/new.png",
      createdAt: "2026-06-02T00:00:00.000Z",
    };

    const result = prependUserStickerAsset(
      [WIDGET_ASSETS[0], existingSticker],
      newSticker,
    );

    expect(result).toEqual([WIDGET_ASSETS[0], newSticker, existingSticker]);
    expect(result[2]).toBe(existingSticker);
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
