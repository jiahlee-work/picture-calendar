import { describe, expect, it } from "vitest";

import { insertRecapCanvasPhotoElements } from "@/application/services/recap/recap-canvas-photo";
import type { RecapCanvasElement } from "@/shared/recap/types";

describe("recap canvas photo insertion", () => {
  it("centers selected photos and offsets each additional photo", () => {
    const result = insertRecapCanvasPhotoElements({
      canvasHeight: 800,
      canvasWidth: 400,
      elementIdPrefix: "recap-photo-batch",
      elements: [createExistingElement()],
      photos: [
        { height: 120, photoId: "daily-photo-1", width: 160 },
        { height: 160, photoId: "daily-photo-2", width: 90 },
      ],
    });

    expect(result).toMatchObject([
      { id: "existing", zIndex: 4 },
      {
        id: "recap-photo-batch-0",
        photoId: "daily-photo-1",
        type: "photo",
        x: 120,
        y: 340,
        zIndex: 5,
      },
      {
        id: "recap-photo-batch-1",
        photoId: "daily-photo-2",
        type: "photo",
        x: 155,
        y: 344,
        zIndex: 6,
      },
    ]);
  });

  it("keeps photo elements inside the minimum insertion bounds", () => {
    const result = insertRecapCanvasPhotoElements({
      canvasHeight: 100,
      canvasWidth: 100,
      elementIdPrefix: "bounded-photo",
      elements: [],
      photos: [{ height: 164, photoId: "daily-photo-1", width: 164 }],
    });

    expect(result).toMatchObject([
      {
        id: "bounded-photo-0",
        x: 24,
        y: 120,
        zIndex: 1,
      },
    ]);
  });

  it("returns the original elements when no photos were measured", () => {
    const elements = [createExistingElement()];

    expect(
      insertRecapCanvasPhotoElements({
        canvasHeight: 800,
        canvasWidth: 400,
        elementIdPrefix: "empty-batch",
        elements,
        photos: [],
      }),
    ).toBe(elements);
  });
});

function createExistingElement(): RecapCanvasElement {
  return {
    id: "existing",
    color: "#121212",
    content: "existing",
    fontSize: 24,
    fontStyle: "normal",
    fontWeight: "normal",
    rotation: 0,
    scale: 1,
    textAlign: "left",
    textDecorationLine: "none",
    type: "text",
    width: 200,
    x: 0,
    y: 0,
    zIndex: 4,
  };
}
