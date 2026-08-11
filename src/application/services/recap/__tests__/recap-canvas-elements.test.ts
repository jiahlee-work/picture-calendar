import { describe, expect, it } from "vitest";

import {
  createRecapPhotoElement,
  createRecapStickerElement,
  createRecapTextElement,
  createRecapWidgetElement,
  deleteRecapCanvasElement,
  getNextRecapCanvasElementZIndex,
  getRecapPhotoElementSize,
  moveRecapCanvasElement,
  updateRecapCanvasTextElement,
  upsertRecapCanvasElement,
} from "@/application/services/recap/recap-canvas-elements";
import type { RecapCanvasElement } from "@/shared/recap/types";

describe("recap canvas elements", () => {
  it("sizes a photo element from its original aspect ratio", () => {
    expect(getRecapPhotoElementSize(1200, 1200)).toEqual({
      height: 164,
      width: 164,
    });
    expect(getRecapPhotoElementSize(1600, 1200)).toEqual({
      height: 123,
      width: 164,
    });
    expect(getRecapPhotoElementSize(1920, 1080)).toEqual({
      height: 92.25,
      width: 164,
    });
    expect(getRecapPhotoElementSize(1080, 1920)).toEqual({
      height: 164,
      width: 92.25,
    });
  });

  it("creates a photo element from a daily photo id", () => {
    expect(
      createRecapPhotoElement({
        height: 92.25,
        id: "photo-element-1",
        photoId: "daily-photo-1",
        width: 164,
        x: 80,
        y: 120,
        zIndex: 4,
      }),
    ).toMatchObject({
      height: 92.25,
      id: "photo-element-1",
      photoId: "daily-photo-1",
      rotation: 0,
      scale: 1,
      type: "photo",
      width: 164,
      x: 80,
      y: 120,
      zIndex: 4,
    });
  });

  it("creates a default text element", () => {
    expect(
      createRecapTextElement({
        id: "text-1",
        x: 120,
        y: 240,
        zIndex: 3,
      }),
    ).toMatchObject({
      id: "text-1",
      color: "#121212",
      content: "텍스트를 입력하려면 두 번 탭하세요.",
      fontSize: 24,
      fontStyle: "normal",
      fontWeight: "normal",
      rotation: 0,
      scale: 1,
      textAlign: "left",
      textDecorationLine: "none",
      type: "text",
      width: 340,
      x: 120,
      y: 240,
      zIndex: 3,
    });
  });

  it("creates a sticker element from a user sticker asset id", () => {
    expect(
      createRecapStickerElement({
        id: "sticker-1",
        stickerAssetId: "user-sticker-1",
        x: 80,
        y: 120,
        zIndex: 4,
      }),
    ).toMatchObject({
      id: "sticker-1",
      rotation: 0,
      scale: 1,
      stickerAssetId: "user-sticker-1",
      type: "sticker",
      x: 80,
      y: 120,
      zIndex: 4,
    });
  });

  it("creates dynamic widget elements", () => {
    expect(
      createRecapWidgetElement({
        id: "widget-calendar-1",
        variant: "calendar",
        x: 80,
        y: 120,
        zIndex: 4,
      }),
    ).toMatchObject({
      id: "widget-calendar-1",
      type: "widget",
      variant: "calendar",
    });
    expect(
      createRecapWidgetElement({
        id: "widget-polaroid-1",
        photoId: "photo-1",
        variant: "polaroidFrame",
        x: 80,
        y: 120,
        zIndex: 5,
      }),
    ).toMatchObject({
      photoId: "photo-1",
      type: "widget",
      variant: "polaroidFrame",
    });
    expect(
      createRecapWidgetElement({
        id: "widget-polaroid-portrait-1",
        photoId: "photo-1",
        variant: "polaroidFramePortrait",
        x: 80,
        y: 120,
        zIndex: 6,
      }),
    ).toMatchObject({
      photoId: "photo-1",
      type: "widget",
      variant: "polaroidFramePortrait",
    });
    expect(
      createRecapWidgetElement({
        id: "widget-bubble-1",
        text: "hello",
        variant: "speechBubble",
        x: 80,
        y: 120,
        zIndex: 7,
      }),
    ).toMatchObject({
      text: "hello",
      type: "widget",
      variant: "speechBubble",
    });
  });

  it("upserts and sorts elements by z-index", () => {
    const elements = [
      createElement({ id: "text-2", zIndex: 2 }),
      createElement({ id: "text-1", zIndex: 1 }),
    ];

    expect(
      upsertRecapCanvasElement(
        elements,
        createElement({ id: "text-2", content: "updated", zIndex: 0 }),
      ),
    ).toMatchObject([{ id: "text-2", content: "updated" }, { id: "text-1" }]);
  });

  it("updates only text elements", () => {
    const elements: RecapCanvasElement[] = [
      createElement({ id: "text-1" }),
      {
        id: "photo-1",
        photoId: "daily-photo-1",
        rotation: 0,
        scale: 1,
        type: "photo",
        x: 0,
        y: 0,
        zIndex: 2,
      },
    ];

    expect(
      updateRecapCanvasTextElement(elements, "text-1", {
        fontWeight: "bold",
        textAlign: "center",
      }),
    ).toMatchObject([
      { id: "text-1", fontWeight: "bold", textAlign: "center" },
      { id: "photo-1", type: "photo" },
    ]);
  });

  it("deletes elements by id", () => {
    expect(
      deleteRecapCanvasElement(
        [createElement({ id: "text-1" }), createElement({ id: "text-2" })],
        "text-1",
      ),
    ).toMatchObject([{ id: "text-2" }]);
  });

  it("resolves the next z-index", () => {
    expect(
      getNextRecapCanvasElementZIndex([
        createElement({ zIndex: 3 }),
        createElement({ zIndex: 7 }),
      ]),
    ).toBe(8);
  });

  it("moves an element one layer forward or backward", () => {
    const elements = [
      createElement({ id: "bottom", zIndex: 1 }),
      createElement({ id: "middle", zIndex: 2 }),
      createElement({ id: "top", zIndex: 3 }),
    ];

    expect(
      moveRecapCanvasElement(elements, "middle", "forward").map(
        (element) => element.id,
      ),
    ).toEqual(["bottom", "top", "middle"]);
    expect(
      moveRecapCanvasElement(elements, "middle", "backward").map(
        (element) => element.id,
      ),
    ).toEqual(["middle", "bottom", "top"]);
  });

  it("keeps an element unchanged at the layer boundary", () => {
    const elements = [
      createElement({ id: "bottom", zIndex: 1 }),
      createElement({ id: "top", zIndex: 2 }),
    ];

    expect(moveRecapCanvasElement(elements, "top", "forward")).toEqual(
      elements,
    );
    expect(moveRecapCanvasElement(elements, "bottom", "backward")).toEqual(
      elements,
    );
  });
});

function createElement(
  overrides: Partial<RecapCanvasElement> = {},
): RecapCanvasElement {
  return {
    id: "text-1",
    color: "#121212",
    content: "text",
    fontSize: 16,
    rotation: 0,
    scale: 1,
    type: "text",
    x: 0,
    y: 0,
    zIndex: 1,
    ...overrides,
  } as RecapCanvasElement;
}
