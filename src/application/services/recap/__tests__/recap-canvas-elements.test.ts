import { describe, expect, it } from "vitest";

import {
  createRecapTextElement,
  deleteRecapCanvasElement,
  getNextRecapCanvasElementZIndex,
  updateRecapCanvasTextElement,
  upsertRecapCanvasElement,
} from "@/application/services/recap/recap-canvas-elements";
import type { RecapCanvasElement } from "@/shared/recap/types";

describe("recap canvas elements", () => {
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
