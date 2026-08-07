import type {
  StickerAsset,
  StickerPlacement,
  StickerPlacementPageType,
} from "@/application/services/stickers/types";

export type StickerPlacementDraftUpdater =
  StickerPlacement[] | ((placements: StickerPlacement[]) => StickerPlacement[]);

export type StickerPlacementUpdate = Partial<Omit<StickerPlacement, "id">>;

export type CreateStickerPlacementDraftOptions = {
  asset: StickerAsset;
  id: string;
  pageId: string;
  pageType: StickerPlacementPageType;
  x: number;
  y: number;
  zIndex: number;
  date?: string;
  rotation?: number;
  scale?: number;
  selectedImageId?: string;
};

export function createStickerPlacementDraft(
  options: CreateStickerPlacementDraftOptions,
): StickerPlacement {
  const {
    asset,
    date,
    id,
    pageId,
    pageType,
    rotation = 0,
    scale = 1,
    selectedImageId,
    x,
    y,
    zIndex,
  } = options;

  return {
    id,
    assetId: asset.id,
    pageType,
    pageId,
    x,
    y,
    scale,
    rotation,
    zIndex,
    widgetState:
      asset.source === "widget"
        ? toInitialWidgetState(asset.variant, { date, selectedImageId })
        : undefined,
  };
}

export function cloneStickerPlacements(
  placements: StickerPlacement[],
): StickerPlacement[] {
  return sortStickerPlacements(placements).map(cloneStickerPlacement);
}

export function resolveStickerPlacementDraftUpdate(
  placements: StickerPlacement[],
  updater: StickerPlacementDraftUpdater,
): StickerPlacement[] {
  const nextPlacements =
    typeof updater === "function"
      ? updater(cloneStickerPlacements(placements))
      : updater;

  return cloneStickerPlacements(nextPlacements);
}

export function upsertStickerPlacement(
  placements: StickerPlacement[],
  placement: StickerPlacement,
): StickerPlacement[] {
  const placementsById = new Map<string, StickerPlacement>();

  for (const currentPlacement of placements) {
    placementsById.set(
      currentPlacement.id,
      cloneStickerPlacement(currentPlacement),
    );
  }

  placementsById.set(placement.id, cloneStickerPlacement(placement));

  return cloneStickerPlacements(Array.from(placementsById.values()));
}

export function updateStickerPlacement(
  placements: StickerPlacement[],
  placementId: string,
  update: StickerPlacementUpdate,
): StickerPlacement[] {
  return cloneStickerPlacements(
    placements.map((placement) => {
      if (placement.id !== placementId) {
        return placement;
      }

      return {
        ...placement,
        ...update,
        id: placement.id,
        widgetState:
          "widgetState" in update
            ? cloneWidgetState(update.widgetState)
            : cloneWidgetState(placement.widgetState),
      };
    }),
  );
}

export function deleteStickerPlacement(
  placements: StickerPlacement[],
  placementId: string,
): StickerPlacement[] {
  return cloneStickerPlacements(
    placements.filter((placement) => placement.id !== placementId),
  );
}

function cloneStickerPlacement(placement: StickerPlacement): StickerPlacement {
  return {
    ...placement,
    widgetState: cloneWidgetState(placement.widgetState),
  };
}

function cloneWidgetState(
  widgetState: StickerPlacement["widgetState"],
): StickerPlacement["widgetState"] {
  if (!widgetState) {
    return undefined;
  }

  return { ...widgetState };
}

function toInitialWidgetState(
  variant: "calendar" | "polaroidFrame" | "speechBubble",
  options: {
    date?: string;
    selectedImageId?: string;
  },
): StickerPlacement["widgetState"] {
  if (variant === "calendar") {
    return {
      variant,
      date: options.date,
    };
  }

  if (variant === "speechBubble") {
    return {
      variant,
    };
  }

  return {
    variant,
    selectedImageId: options.selectedImageId,
  };
}

function sortStickerPlacements(
  placements: StickerPlacement[],
): StickerPlacement[] {
  return [...placements].sort((left, right) => {
    const zIndexOrder = left.zIndex - right.zIndex;

    return zIndexOrder === 0 ? left.id.localeCompare(right.id) : zIndexOrder;
  });
}
