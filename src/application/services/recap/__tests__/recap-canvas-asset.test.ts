import { describe, expect, it } from "vitest";

import { createRecapCanvasAssetInsertion } from "@/application/services/recap/recap-canvas-asset";
import type { StickerAsset } from "@/application/services/stickers/types";

describe("recap canvas asset insertion", () => {
  it("creates a sticker element without closing the picker", () => {
    expect(
      createRecapCanvasAssetInsertion({
        asset: createAsset({
          id: "sticker-1",
          imagePath: "file://sticker.png",
          source: "sticker",
          storageKey: "sticker.png",
          userId: "user-1",
          createdAt: "2026-08-12T00:00:00.000Z",
        }),
        id: "element-1",
        x: 10,
        y: 20,
        zIndex: 3,
      }),
    ).toMatchObject({
      element: {
        id: "element-1",
        stickerAssetId: "sticker-1",
        type: "sticker",
      },
      shouldClosePicker: false,
      shouldStartWidgetEditing: false,
    });
  });

  it("starts editing a new speech bubble after closing the picker", () => {
    expect(
      createRecapCanvasAssetInsertion({
        asset: createAsset({
          id: "widget-speech-bubble",
          name: "말풍선",
          source: "widget",
          variant: "speechBubble",
        }),
        id: "element-2",
        x: 10,
        y: 20,
        zIndex: 4,
      }),
    ).toMatchObject({
      element: {
        id: "element-2",
        text: "텍스트 입력",
        type: "widget",
        variant: "speechBubble",
      },
      shouldClosePicker: true,
      shouldStartWidgetEditing: true,
    });
  });

  it.each(["calendar", "polaroidFrame", "polaroidFramePortrait"] as const)(
    "keeps the picker open after inserting the %s widget",
    (variant) => {
      expect(
        createRecapCanvasAssetInsertion({
          asset: createAsset({
            id: `widget-${variant}`,
            name: variant,
            source: "widget",
            variant,
          }),
          id: "element-3",
          x: 10,
          y: 20,
          zIndex: 5,
        }),
      ).toMatchObject({
        element: { type: "widget", variant },
        shouldClosePicker: false,
        shouldStartWidgetEditing: false,
      });
    },
  );
});

function createAsset(asset: StickerAsset): StickerAsset {
  return asset;
}
