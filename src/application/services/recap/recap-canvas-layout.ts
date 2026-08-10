import {
  RecapCanvasLayoutId,
  type RecapCanvasLayoutId as RecapCanvasLayoutIdType,
} from "@/shared/recap/types";

export type RecapCanvasLayoutSlot = {
  height: number;
  id: string;
  width: number;
  x: number;
  y: number;
};

export type RecapCanvasLayoutLine = {
  endX: number;
  endY: number;
  id: string;
  startX: number;
  startY: number;
};

export type RecapCanvasLayoutDefinition = {
  id: RecapCanvasLayoutIdType;
  lines: RecapCanvasLayoutLine[];
  slotCount: number;
  slots: RecapCanvasLayoutSlot[];
};

export type RecapCanvasLayoutSlotPhotoMap = Record<string, string | null>;

export const RECAP_CANVAS_LAYOUTS: RecapCanvasLayoutDefinition[] = [
  {
    id: RecapCanvasLayoutId.twoColumns,
    lines: [
      {
        endX: 0.5,
        endY: 1,
        id: "center-vertical",
        startX: 0.5,
        startY: 0,
      },
    ],
    slotCount: 2,
    slots: [
      { height: 1, id: "left", width: 0.5, x: 0, y: 0 },
      { height: 1, id: "right", width: 0.5, x: 0.5, y: 0 },
    ],
  },
  {
    id: RecapCanvasLayoutId.twoRows,
    lines: [
      {
        endX: 1,
        endY: 0.5,
        id: "center-horizontal",
        startX: 0,
        startY: 0.5,
      },
    ],
    slotCount: 2,
    slots: [
      { height: 0.5, id: "top", width: 1, x: 0, y: 0 },
      { height: 0.5, id: "bottom", width: 1, x: 0, y: 0.5 },
    ],
  },
  {
    id: RecapCanvasLayoutId.threeRows,
    lines: [
      {
        endX: 1,
        endY: 1 / 3,
        id: "first-horizontal",
        startX: 0,
        startY: 1 / 3,
      },
      {
        endX: 1,
        endY: 2 / 3,
        id: "second-horizontal",
        startX: 0,
        startY: 2 / 3,
      },
    ],
    slotCount: 3,
    slots: [
      { height: 1 / 3, id: "top", width: 1, x: 0, y: 0 },
      { height: 1 / 3, id: "middle", width: 1, x: 0, y: 1 / 3 },
      { height: 1 / 3, id: "bottom", width: 1, x: 0, y: 2 / 3 },
    ],
  },
  {
    id: RecapCanvasLayoutId.fourGrid,
    lines: [
      {
        endX: 0.5,
        endY: 1,
        id: "center-vertical",
        startX: 0.5,
        startY: 0,
      },
      {
        endX: 1,
        endY: 0.5,
        id: "center-horizontal",
        startX: 0,
        startY: 0.5,
      },
    ],
    slotCount: 4,
    slots: [
      { height: 0.5, id: "top-left", width: 0.5, x: 0, y: 0 },
      { height: 0.5, id: "top-right", width: 0.5, x: 0.5, y: 0 },
      { height: 0.5, id: "bottom-left", width: 0.5, x: 0, y: 0.5 },
      { height: 0.5, id: "bottom-right", width: 0.5, x: 0.5, y: 0.5 },
    ],
  },
  {
    id: RecapCanvasLayoutId.onePhoto,
    lines: [],
    slotCount: 1,
    slots: [{ height: 1, id: "photo", width: 1, x: 0, y: 0 }],
  },
];

export function getRecapCanvasLayoutDefinition(
  layoutId: RecapCanvasLayoutIdType,
): RecapCanvasLayoutDefinition {
  return (
    RECAP_CANVAS_LAYOUTS.find((layout) => layout.id === layoutId) ??
    RECAP_CANVAS_LAYOUTS[0]
  );
}

export function createEmptyRecapCanvasLayoutSlotPhotoMap(
  layout: RecapCanvasLayoutDefinition,
): RecapCanvasLayoutSlotPhotoMap {
  return Object.fromEntries(layout.slots.map((slot) => [slot.id, null]));
}

export function isRecapCanvasLayoutPhotoSelectionComplete({
  layout,
  slotPhotoIds,
}: {
  layout: RecapCanvasLayoutDefinition;
  slotPhotoIds: RecapCanvasLayoutSlotPhotoMap;
}): boolean {
  return layout.slots.every((slot) => Boolean(slotPhotoIds[slot.id]));
}
