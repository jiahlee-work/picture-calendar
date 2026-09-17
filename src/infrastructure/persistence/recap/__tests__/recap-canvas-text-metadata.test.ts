import { describe, expect, it } from "vitest";

import { parseRecapCanvasTextMetadata } from "@/infrastructure/persistence/recap/recap-canvas-text-metadata";
import type { RecapCanvasBaseElement } from "@/shared/recap/types";

describe("recap canvas text metadata", () => {
  it("preserves an empty text value and its resized width", () => {
    expect(
      parseRecapCanvasTextMetadata(
        {
          color: "#121212",
          content: "",
          fontSize: 24,
          width: 412,
        },
        createBaseElement(),
      ),
    ).toMatchObject({ content: "", type: "text", width: 412 });
  });

  it("rejects missing required text metadata", () => {
    expect(
      parseRecapCanvasTextMetadata(
        { color: "#121212", fontSize: 24 },
        createBaseElement(),
      ),
    ).toBeNull();
    expect(
      parseRecapCanvasTextMetadata(
        { color: "", content: "text", fontSize: 24 },
        createBaseElement(),
      ),
    ).toBeNull();
  });
});

function createBaseElement(): RecapCanvasBaseElement {
  return {
    id: "text-1",
    rotation: 0,
    scale: 1,
    type: "text",
    x: 0,
    y: 0,
    zIndex: 1,
  };
}
