import {
  createEmptyRecapCanvasLayoutSlotPhotoMap,
  getRecapCanvasLayoutDefinition,
  isRecapCanvasLayoutPhotoSelectionComplete,
  type RecapCanvasLayoutSlotPhotoMap,
} from "@/application/services/recap/recap-canvas-layout";
import type {
  RecapCanvasLayoutId,
  RecapCanvasLayoutState,
} from "@/shared/recap/types";

type SlotPhotoIdsByLayoutId = Partial<
  Record<RecapCanvasLayoutId, RecapCanvasLayoutSlotPhotoMap>
>;

export type RecapCanvasLayoutDraft = {
  layoutId: RecapCanvasLayoutId | null;
  slotPhotoIdsByLayoutId: SlotPhotoIdsByLayoutId;
};

export function createRecapCanvasLayoutDraft(
  committedLayout: RecapCanvasLayoutState | null,
  defaultLayoutId: RecapCanvasLayoutId,
): RecapCanvasLayoutDraft {
  const layoutId = committedLayout?.layoutId ?? defaultLayoutId;
  const slotPhotoIds = committedLayout
    ? cloneSlotPhotoIds(committedLayout.slotPhotoIds)
    : createEmptyRecapCanvasLayoutSlotPhotoMap(
        getRecapCanvasLayoutDefinition(defaultLayoutId),
      );

  return {
    layoutId,
    slotPhotoIdsByLayoutId: {
      [layoutId]: slotPhotoIds,
    },
  };
}

export function selectRecapCanvasLayoutDraft(
  draft: RecapCanvasLayoutDraft,
  layoutId: RecapCanvasLayoutId | null,
): RecapCanvasLayoutDraft {
  if (!layoutId || draft.slotPhotoIdsByLayoutId[layoutId]) {
    return {
      layoutId,
      slotPhotoIdsByLayoutId: cloneSlotPhotoIdsByLayoutId(
        draft.slotPhotoIdsByLayoutId,
      ),
    };
  }

  return {
    layoutId,
    slotPhotoIdsByLayoutId: {
      ...cloneSlotPhotoIdsByLayoutId(draft.slotPhotoIdsByLayoutId),
      [layoutId]: createEmptyRecapCanvasLayoutSlotPhotoMap(
        getRecapCanvasLayoutDefinition(layoutId),
      ),
    },
  };
}

export function updateRecapCanvasLayoutDraftSlot(
  draft: RecapCanvasLayoutDraft,
  slotId: string,
  photoId: string | null,
): RecapCanvasLayoutDraft {
  if (!draft.layoutId) {
    return cloneDraft(draft);
  }

  const layout = getRecapCanvasLayoutDefinition(draft.layoutId);

  if (!layout.slots.some((slot) => slot.id === slotId)) {
    return cloneDraft(draft);
  }

  return {
    layoutId: draft.layoutId,
    slotPhotoIdsByLayoutId: {
      ...cloneSlotPhotoIdsByLayoutId(draft.slotPhotoIdsByLayoutId),
      [draft.layoutId]: {
        ...getRecapCanvasLayoutDraftSlotPhotoIds(draft),
        [slotId]: photoId,
      },
    },
  };
}

export function getRecapCanvasLayoutDraftSlotPhotoIds(
  draft: RecapCanvasLayoutDraft,
): RecapCanvasLayoutSlotPhotoMap {
  if (!draft.layoutId) {
    return {};
  }

  return cloneSlotPhotoIds(
    draft.slotPhotoIdsByLayoutId[draft.layoutId] ??
      createEmptyRecapCanvasLayoutSlotPhotoMap(
        getRecapCanvasLayoutDefinition(draft.layoutId),
      ),
  );
}

export function isRecapCanvasLayoutDraftComplete(
  draft: RecapCanvasLayoutDraft,
): boolean {
  if (!draft.layoutId) {
    return true;
  }

  return isRecapCanvasLayoutPhotoSelectionComplete({
    layout: getRecapCanvasLayoutDefinition(draft.layoutId),
    slotPhotoIds: getRecapCanvasLayoutDraftSlotPhotoIds(draft),
  });
}

export function toRecapCanvasLayoutState(
  draft: RecapCanvasLayoutDraft,
): RecapCanvasLayoutState | null {
  if (!draft.layoutId) {
    return null;
  }

  return {
    layoutId: draft.layoutId,
    slotPhotoIds: getRecapCanvasLayoutDraftSlotPhotoIds(draft),
  };
}

function cloneDraft(draft: RecapCanvasLayoutDraft): RecapCanvasLayoutDraft {
  return {
    layoutId: draft.layoutId,
    slotPhotoIdsByLayoutId: cloneSlotPhotoIdsByLayoutId(
      draft.slotPhotoIdsByLayoutId,
    ),
  };
}

function cloneSlotPhotoIdsByLayoutId(
  slotPhotoIdsByLayoutId: SlotPhotoIdsByLayoutId,
): SlotPhotoIdsByLayoutId {
  return Object.fromEntries(
    Object.entries(slotPhotoIdsByLayoutId).map(([layoutId, slotPhotoIds]) => [
      layoutId,
      cloneSlotPhotoIds(slotPhotoIds),
    ]),
  );
}

function cloneSlotPhotoIds(
  slotPhotoIds: RecapCanvasLayoutSlotPhotoMap,
): RecapCanvasLayoutSlotPhotoMap {
  return { ...slotPhotoIds };
}
