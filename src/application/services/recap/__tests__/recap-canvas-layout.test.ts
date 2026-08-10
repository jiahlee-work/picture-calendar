import { describe, expect, it } from "vitest";

import {
  createEmptyRecapCanvasLayoutSlotPhotoMap,
  getRecapCanvasLayoutDefinition,
  isRecapCanvasLayoutPhotoSelectionComplete,
} from "@/application/services/recap/recap-canvas-layout";
import { RecapCanvasLayoutId } from "@/shared/recap/types";

describe("recap canvas layout", () => {
  it("defines a full-canvas layout with one photo slot and no guide lines", () => {
    const layout = getRecapCanvasLayoutDefinition(RecapCanvasLayoutId.onePhoto);

    expect(layout).toEqual({
      id: RecapCanvasLayoutId.onePhoto,
      lines: [],
      slotCount: 1,
      slots: [{ height: 1, id: "photo", width: 1, x: 0, y: 0 }],
    });
  });

  it("creates an empty photo map for every layout slot", () => {
    const layout = getRecapCanvasLayoutDefinition(
      RecapCanvasLayoutId.threeRows,
    );

    expect(createEmptyRecapCanvasLayoutSlotPhotoMap(layout)).toEqual({
      bottom: null,
      middle: null,
      top: null,
    });
  });

  it("requires every layout slot to have a photo", () => {
    const layout = getRecapCanvasLayoutDefinition(
      RecapCanvasLayoutId.twoColumns,
    );

    expect(
      isRecapCanvasLayoutPhotoSelectionComplete({
        layout,
        slotPhotoIds: {
          left: "photo-1",
          right: null,
        },
      }),
    ).toBe(false);
    expect(
      isRecapCanvasLayoutPhotoSelectionComplete({
        layout,
        slotPhotoIds: {
          left: "photo-1",
          right: "photo-2",
        },
      }),
    ).toBe(true);
  });
});
