import { describe, expect, it } from "vitest";

import {
  createEmptyRecapCanvasLayoutSlotPhotoMap,
  getRecapCanvasLayoutDefinition,
  isRecapCanvasLayoutPhotoSelectionComplete,
} from "@/application/services/recap/recap-canvas-layout";
import { RecapCanvasLayoutId } from "@/shared/recap/types";

describe("recap canvas layout", () => {
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
