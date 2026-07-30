import type {
  StickerPlacement,
  StickerPlacementMetadataStore,
  StickerPlacementPageType,
  StickerPlacementRepository,
  StoredStickerPlacement,
} from "@/shared/stickers/types";

type LocalStickerPlacementRepositoryOptions = {
  initialPlacements?: StoredStickerPlacement[];
  metadataStore?: StickerPlacementMetadataStore;
};

export function createLocalStickerPlacementRepository(
  options:
    LocalStickerPlacementRepositoryOptions | StoredStickerPlacement[] = [],
): StickerPlacementRepository {
  const normalizedOptions = Array.isArray(options)
    ? { initialPlacements: options }
    : options;
  const metadataStore =
    normalizedOptions.metadataStore ??
    createMemoryStickerPlacementMetadataStore(
      normalizedOptions.initialPlacements ?? [],
    );

  return {
    async listByPage(userId, pageType, pageId) {
      const placements = await metadataStore.load();

      return toPagePlacements(placements, userId, pageType, pageId);
    },
    async savePagePlacements(userId, pageType, pageId, placements) {
      const allPlacements = await metadataStore.load();
      const nextPagePlacements = toUniquePagePlacementRecords(
        userId,
        pageType,
        pageId,
        placements,
      );
      const nextPlacements = [
        ...allPlacements.filter(
          (placement) =>
            !isStoredPlacementOnPage(placement, userId, pageType, pageId),
        ),
        ...nextPagePlacements,
      ];

      await metadataStore.save(nextPlacements);

      return toStickerPlacements(nextPagePlacements);
    },
    async deletePagePlacements(userId, pageType, pageId) {
      const allPlacements = await metadataStore.load();
      const deletedPlacements = toPagePlacements(
        allPlacements,
        userId,
        pageType,
        pageId,
      );
      const nextPlacements = allPlacements.filter(
        (placement) =>
          !isStoredPlacementOnPage(placement, userId, pageType, pageId),
      );

      await metadataStore.save(nextPlacements);

      return deletedPlacements;
    },
  };
}

function createMemoryStickerPlacementMetadataStore(
  initialPlacements: StoredStickerPlacement[],
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

function toPagePlacements(
  placements: StoredStickerPlacement[],
  userId: string,
  pageType: StickerPlacementPageType,
  pageId: string,
): StickerPlacement[] {
  return toStickerPlacements(
    placements.filter((placement) =>
      isStoredPlacementOnPage(placement, userId, pageType, pageId),
    ),
  );
}

function toUniquePagePlacementRecords(
  userId: string,
  pageType: StickerPlacementPageType,
  pageId: string,
  placements: StickerPlacement[],
): StoredStickerPlacement[] {
  const placementsById = new Map<string, StoredStickerPlacement>();

  for (const placement of placements) {
    placementsById.set(placement.id, {
      ...placement,
      userId,
      pageType,
      pageId,
    });
  }

  return sortStoredPlacements(Array.from(placementsById.values()));
}

function isStoredPlacementOnPage(
  placement: StoredStickerPlacement,
  userId: string,
  pageType: StickerPlacementPageType,
  pageId: string,
) {
  return (
    placement.userId === userId &&
    placement.pageType === pageType &&
    placement.pageId === pageId
  );
}

function toStickerPlacements(
  placements: StoredStickerPlacement[],
): StickerPlacement[] {
  return sortStoredPlacements(placements).map(({ userId, ...placement }) => {
    return placement;
  });
}

function sortStoredPlacements(
  placements: StoredStickerPlacement[],
): StoredStickerPlacement[] {
  return [...placements].sort((left, right) => {
    const zIndexOrder = left.zIndex - right.zIndex;

    return zIndexOrder === 0 ? left.id.localeCompare(right.id) : zIndexOrder;
  });
}
