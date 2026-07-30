import { describe, expect, it } from "vitest";

import { createLocalStickerPlacementRepository } from "@/infrastructure/persistence/stickers/local-sticker-placement-repository";
import type {
  StickerPlacement,
  StickerPlacementMetadataStore,
  StoredStickerPlacement,
} from "@/shared/stickers/types";

describe("createLocalStickerPlacementRepository", () => {
  it("lists only placements for the requested user's page", async () => {
    const repository = createLocalStickerPlacementRepository({
      initialPlacements: [
        createStoredPlacement({
          id: "placement-2",
          userId: "user-1",
          pageType: "calendar",
          pageId: "2026-07",
          zIndex: 2,
        }),
        createStoredPlacement({
          id: "placement-1",
          userId: "user-1",
          pageType: "calendar",
          pageId: "2026-07",
          zIndex: 1,
        }),
        createStoredPlacement({
          id: "other-page-placement",
          userId: "user-1",
          pageType: "calendarRecap",
          pageId: "2026-07",
        }),
        createStoredPlacement({
          id: "other-user-placement",
          userId: "user-2",
          pageType: "calendar",
          pageId: "2026-07",
        }),
      ],
    });

    await expect(
      repository.listByPage("user-1", "calendar", "2026-07"),
    ).resolves.toMatchObject([
      { id: "placement-1", pageType: "calendar", pageId: "2026-07" },
      { id: "placement-2", pageType: "calendar", pageId: "2026-07" },
    ]);
  });

  it("replaces placements for one page while preserving other pages", async () => {
    const metadataStore = createFakePlacementMetadataStore([
      createStoredPlacement({
        id: "old-placement",
        userId: "user-1",
        pageType: "calendar",
        pageId: "2026-07",
      }),
      createStoredPlacement({
        id: "other-page-placement",
        userId: "user-1",
        pageType: "calendarRecap",
        pageId: "2026-07",
      }),
    ]);
    const repository = createLocalStickerPlacementRepository({
      metadataStore,
    });

    await expect(
      repository.savePagePlacements("user-1", "calendar", "2026-07", [
        createPlacement({
          id: "new-placement",
          pageType: "calendarRecap",
          pageId: "ignored-page-id",
          x: 12,
          zIndex: 3,
        }),
      ]),
    ).resolves.toMatchObject([
      {
        id: "new-placement",
        pageType: "calendar",
        pageId: "2026-07",
        x: 12,
        zIndex: 3,
      },
    ]);

    const restoredRepository = createLocalStickerPlacementRepository({
      metadataStore,
    });

    await expect(
      restoredRepository.listByPage("user-1", "calendar", "2026-07"),
    ).resolves.toMatchObject([{ id: "new-placement" }]);
    await expect(
      restoredRepository.listByPage("user-1", "calendarRecap", "2026-07"),
    ).resolves.toMatchObject([{ id: "other-page-placement" }]);
  });

  it("deduplicates saved placements by id using the latest placement", async () => {
    const repository = createLocalStickerPlacementRepository();

    await expect(
      repository.savePagePlacements("user-1", "calendar", "2026-07", [
        createPlacement({ id: "placement-1", x: 10 }),
        createPlacement({ id: "placement-1", x: 20 }),
      ]),
    ).resolves.toMatchObject([{ id: "placement-1", x: 20 }]);
  });

  it("deletes placements for one page and returns the deleted placements", async () => {
    const repository = createLocalStickerPlacementRepository({
      initialPlacements: [
        createStoredPlacement({
          id: "deleted-placement",
          userId: "user-1",
          pageType: "calendar",
          pageId: "2026-07",
        }),
        createStoredPlacement({
          id: "kept-placement",
          userId: "user-1",
          pageType: "calendar",
          pageId: "2026-08",
        }),
      ],
    });

    await expect(
      repository.deletePagePlacements("user-1", "calendar", "2026-07"),
    ).resolves.toMatchObject([{ id: "deleted-placement" }]);
    await expect(
      repository.listByPage("user-1", "calendar", "2026-07"),
    ).resolves.toEqual([]);
    await expect(
      repository.listByPage("user-1", "calendar", "2026-08"),
    ).resolves.toMatchObject([{ id: "kept-placement" }]);
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

function createStoredPlacement(
  overrides: Partial<StoredStickerPlacement> = {},
): StoredStickerPlacement {
  return {
    ...createPlacement(overrides),
    userId: "user-1",
    ...overrides,
  };
}

function createFakePlacementMetadataStore(
  initialPlacements: StoredStickerPlacement[] = [],
): StickerPlacementMetadataStore {
  let placements = [...initialPlacements];

  return {
    async load() {
      return placements;
    },
    async save(nextPlacements) {
      placements = [...nextPlacements];
    },
  };
}
