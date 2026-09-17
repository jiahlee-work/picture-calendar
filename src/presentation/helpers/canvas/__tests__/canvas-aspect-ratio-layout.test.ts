import { describe, expect, it } from "vitest";

import { getCanvasDimensions } from "@/presentation/helpers/canvas/canvas-aspect-ratio-layout";
import { RecapCanvasAspectRatio } from "@/shared/recap/types";

describe("getCanvasDimensions", () => {
  const portraitBounds = { height: 900, width: 450 };

  it("keeps the available dimensions for the device ratio", () => {
    expect(
      getCanvasDimensions(RecapCanvasAspectRatio.device, portraitBounds),
    ).toEqual(portraitBounds);
  });

  it("fits a 4:5 canvas inside the available dimensions", () => {
    expect(
      getCanvasDimensions(
        RecapCanvasAspectRatio.portraitFourFive,
        portraitBounds,
      ),
    ).toEqual({ height: 563, width: 450 });
  });

  it("fits a 9:16 canvas inside the available dimensions", () => {
    expect(
      getCanvasDimensions(
        RecapCanvasAspectRatio.portraitNineSixteen,
        portraitBounds,
      ),
    ).toEqual({ height: 800, width: 450 });
  });

  it("limits the width when the available height is shorter", () => {
    expect(
      getCanvasDimensions(RecapCanvasAspectRatio.portraitFourFive, {
        height: 400,
        width: 450,
      }),
    ).toEqual({ height: 400, width: 320 });
  });
});
