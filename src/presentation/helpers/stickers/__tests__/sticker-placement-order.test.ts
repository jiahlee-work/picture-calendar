import { describe, expect, it } from "vitest";

import {
  moveStickerPlacementZIndex,
  normalizeStickerPlacementZIndexes,
  sortStickerPlacements,
} from "@/presentation/helpers/stickers/sticker-placement-order";
import type { StickerPlacement } from "@/application/services/stickers/types";

describe("sticker placement order", () => {
  it("sorts placements by z-index and id", () => {
    expect(
      sortStickerPlacements([
        createPlacement({ id: "b", zIndex: 2 }),
        createPlacement({ id: "a", zIndex: 2 }),
        createPlacement({ id: "c", zIndex: 1 }),
      ]),
    ).toMatchObject([{ id: "c" }, { id: "a" }, { id: "b" }]);
  });

  it("normalizes z-index values to the current order", () => {
    expect(
      normalizeStickerPlacementZIndexes([
        createPlacement({ id: "b", zIndex: 20 }),
        createPlacement({ id: "a", zIndex: 10 }),
      ]),
    ).toMatchObject([
      { id: "b", zIndex: 1 },
      { id: "a", zIndex: 2 },
    ]);
  });

  it("moves a placement forward one layer", () => {
    expect(
      moveStickerPlacementZIndex(
        [
          createPlacement({ id: "a", zIndex: 1 }),
          createPlacement({ id: "b", zIndex: 2 }),
          createPlacement({ id: "c", zIndex: 3 }),
        ],
        "a",
        "forward",
      ),
    ).toMatchObject([
      { id: "b", zIndex: 1 },
      { id: "a", zIndex: 2 },
      { id: "c", zIndex: 3 },
    ]);
  });

  it("moves a placement backward one layer", () => {
    expect(
      moveStickerPlacementZIndex(
        [
          createPlacement({ id: "a", zIndex: 1 }),
          createPlacement({ id: "b", zIndex: 2 }),
          createPlacement({ id: "c", zIndex: 3 }),
        ],
        "c",
        "backward",
      ),
    ).toMatchObject([
      { id: "a", zIndex: 1 },
      { id: "c", zIndex: 2 },
      { id: "b", zIndex: 3 },
    ]);
  });
});

function createPlacement(
  overrides: Partial<StickerPlacement> = {},
): StickerPlacement {
  return {
    id: "placement",
    assetId: "asset",
    pageType: "calendar",
    pageId: "2026-07",
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    zIndex: 1,
    ...overrides,
  };
}
