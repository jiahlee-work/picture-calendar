import { describe, expect, it } from "vitest";

import {
  cloneStickerPlacements,
  createStickerPlacementDraft,
  deleteStickerPlacement,
  resolveStickerPlacementDraftUpdate,
  updateStickerPlacement,
  upsertStickerPlacement,
} from "@/application/services/stickers/sticker-placement-draft";
import type {
  BuiltInStickerAsset,
  StickerPlacement,
  UserStickerAsset,
} from "@/application/services/stickers/types";

describe("sticker placement draft helpers", () => {
  it("creates a user sticker placement without built-in state", () => {
    expect(
      createStickerPlacementDraft({
        asset: createUserStickerAsset(),
        id: "placement-1",
        pageType: "calendar",
        pageId: "2026-07",
        x: 120,
        y: 220,
        zIndex: 3,
      }),
    ).toEqual({
      id: "placement-1",
      assetId: "user-sticker",
      pageType: "calendar",
      pageId: "2026-07",
      x: 120,
      y: 220,
      scale: 1,
      rotation: 0,
      zIndex: 3,
      builtInState: undefined,
    });
  });

  it("creates a built-in calendar placement with initial state", () => {
    expect(
      createStickerPlacementDraft({
        asset: createBuiltInStickerAsset(),
        id: "placement-1",
        pageType: "calendar",
        pageId: "2026-07",
        x: 120,
        y: 220,
        zIndex: 3,
        date: "2026-07-01",
      }),
    ).toMatchObject({
      id: "placement-1",
      assetId: "built-in-calendar",
      builtInState: {
        variant: "calendar",
        date: "2026-07-01",
      },
    });
  });

  it("clones and sorts placements by z-index", () => {
    const placements = [
      createPlacement({ id: "placement-2", zIndex: 2 }),
      createPlacement({ id: "placement-1", zIndex: 1 }),
    ];
    const cloned = cloneStickerPlacements(placements);

    expect(cloned).toMatchObject([
      { id: "placement-1" },
      { id: "placement-2" },
    ]);
    expect(cloned).not.toBe(placements);
    expect(cloned[0]).not.toBe(placements[1]);
  });

  it("resolves functional draft updates from a cloned current list", () => {
    const placements = [
      createPlacement({
        id: "placement-1",
        builtInState: { variant: "calendar", date: "2026-07-01" },
      }),
    ];
    const nextPlacements = resolveStickerPlacementDraftUpdate(
      placements,
      (currentPlacements) => {
        currentPlacements[0].x = 100;

        if (currentPlacements[0].builtInState?.variant === "calendar") {
          currentPlacements[0].builtInState.date = "2026-07-02";
        }

        return currentPlacements;
      },
    );

    expect(nextPlacements).toMatchObject([
      {
        id: "placement-1",
        x: 100,
        builtInState: { variant: "calendar", date: "2026-07-02" },
      },
    ]);
    expect(placements).toMatchObject([
      {
        id: "placement-1",
        x: 0,
        builtInState: { variant: "calendar", date: "2026-07-01" },
      },
    ]);
  });

  it("upserts placements by id", () => {
    const placements = [
      createPlacement({ id: "placement-1", x: 10 }),
      createPlacement({ id: "placement-2", x: 20 }),
    ];

    expect(
      upsertStickerPlacement(
        placements,
        createPlacement({ id: "placement-1", x: 30 }),
      ),
    ).toMatchObject([
      { id: "placement-1", x: 30 },
      { id: "placement-2", x: 20 },
    ]);
  });

  it("updates a placement without changing its id", () => {
    const placements = [createPlacement({ id: "placement-1", x: 10 })];

    expect(
      updateStickerPlacement(placements, "placement-1", {
        x: 24,
        rotation: -8,
      }),
    ).toMatchObject([{ id: "placement-1", x: 24, rotation: -8 }]);
  });

  it("deletes a placement by id", () => {
    const placements = [
      createPlacement({ id: "placement-1" }),
      createPlacement({ id: "placement-2" }),
    ];

    expect(deleteStickerPlacement(placements, "placement-1")).toMatchObject([
      { id: "placement-2" },
    ]);
  });
});

function createPlacement(
  overrides: Partial<StickerPlacement> = {},
): StickerPlacement {
  return {
    id: "placement-1",
    assetId: "asset-1",
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

function createUserStickerAsset(
  overrides: Partial<UserStickerAsset> = {},
): UserStickerAsset {
  return {
    id: "user-sticker",
    source: "user",
    userId: "user-1",
    imagePath: "file://sticker.png",
    storageKey: null,
    createdAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

function createBuiltInStickerAsset(
  overrides: Partial<BuiltInStickerAsset> = {},
): BuiltInStickerAsset {
  return {
    id: "built-in-calendar",
    source: "builtIn",
    name: "달력",
    variant: "calendar",
    ...overrides,
  };
}
