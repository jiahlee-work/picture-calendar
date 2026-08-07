import type { StickerPlacement } from "@/application/services/stickers/types";

type StickerPlacementDirection = "backward" | "forward";

export function moveStickerPlacementZIndex(
  placements: StickerPlacement[],
  placementId: string,
  direction: StickerPlacementDirection,
): StickerPlacement[] {
  const orderedPlacements = sortStickerPlacements(placements);
  const currentIndex = orderedPlacements.findIndex(
    (placement) => placement.id === placementId,
  );

  if (currentIndex < 0) {
    return normalizeStickerPlacementZIndexes(orderedPlacements);
  }

  const nextIndex =
    direction === "forward" ? currentIndex + 1 : currentIndex - 1;

  if (nextIndex < 0 || nextIndex >= orderedPlacements.length) {
    return normalizeStickerPlacementZIndexes(orderedPlacements);
  }

  const nextPlacements = [...orderedPlacements];
  const currentPlacement = nextPlacements[currentIndex];

  nextPlacements[currentIndex] = nextPlacements[nextIndex];
  nextPlacements[nextIndex] = currentPlacement;

  return normalizeStickerPlacementZIndexes(nextPlacements);
}

export function normalizeStickerPlacementZIndexes(
  placements: StickerPlacement[],
): StickerPlacement[] {
  return placements.map((placement, index) => ({
    ...placement,
    widgetState: placement.widgetState
      ? { ...placement.widgetState }
      : undefined,
    zIndex: index + 1,
  }));
}

export function sortStickerPlacements(
  placements: StickerPlacement[],
): StickerPlacement[] {
  return [...placements].sort((left, right) => {
    const zIndexOrder = left.zIndex - right.zIndex;

    return zIndexOrder === 0 ? left.id.localeCompare(right.id) : zIndexOrder;
  });
}
