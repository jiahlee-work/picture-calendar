import { describe, expect, it } from "vitest";

import { resolveRecapCanvasTap } from "@/application/services/recap/recap-canvas-interaction";

describe("recap canvas interaction", () => {
  it("starts editing only on the second tap in a double-tap sequence", () => {
    const firstTap = resolveRecapCanvasTap(0, 1_000);
    const secondTap = resolveRecapCanvasTap(firstTap.nextLastTapAt, 1_200);
    const thirdTap = resolveRecapCanvasTap(secondTap.nextLastTapAt, 1_300);

    expect(firstTap).toEqual({
      nextLastTapAt: 1_000,
      shouldStartEditing: false,
    });
    expect(secondTap).toEqual({
      nextLastTapAt: 0,
      shouldStartEditing: true,
    });
    expect(thirdTap).toEqual({
      nextLastTapAt: 1_300,
      shouldStartEditing: false,
    });
  });

  it("does not treat a delayed or reversed timestamp as a double tap", () => {
    expect(resolveRecapCanvasTap(1_000, 1_500).shouldStartEditing).toBe(false);
    expect(resolveRecapCanvasTap(1_000, 900).shouldStartEditing).toBe(false);
  });
});
