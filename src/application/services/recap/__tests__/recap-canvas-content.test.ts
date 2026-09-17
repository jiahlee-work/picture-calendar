import { describe, expect, it } from "vitest";

import { hasRecapCanvasContent } from "@/application/services/recap/recap-canvas-content";
import { RecapCanvasAspectRatio } from "@/shared/recap/types";

describe("hasRecapCanvasContent", () => {
  it("저장된 비율만 있는 캔버스는 empty로 판단한다", () => {
    expect(
      hasRecapCanvasContent({
        aspectRatio: RecapCanvasAspectRatio.device,
        backgroundColor: "#ffffff",
        elements: [],
        layout: null,
      }),
    ).toBe(false);
  });

  it("요소가 있으면 콘텐츠가 있는 것으로 판단한다", () => {
    expect(
      hasRecapCanvasContent({
        backgroundColor: "#ffffff",
        elements: [
          {
            id: "sticker-1",
            rotation: 0,
            scale: 1,
            stickerAssetId: "asset-1",
            type: "sticker",
            x: 0,
            y: 0,
            zIndex: 1,
          },
        ],
        layout: null,
      }),
    ).toBe(true);
  });

  it("배경색을 변경했으면 콘텐츠가 있는 것으로 판단한다", () => {
    expect(
      hasRecapCanvasContent({
        backgroundColor: "#fefefe",
        elements: [],
        layout: null,
      }),
    ).toBe(true);
  });
});
