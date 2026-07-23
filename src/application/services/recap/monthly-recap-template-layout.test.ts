import { describe, expect, it } from "vitest";

import {
  getCalendarRecapCardSize,
  getCalendarRecapPhotoSlotLayout,
  getMessageRecapPhotoFrameLayout,
  getMessageRecapPhotoGroupSize,
} from "@/application/services/recap/monthly-recap-template-layout";

describe("monthly recap template layout", () => {
  it("places message photos inside a flow-based photo group", () => {
    expect(getMessageRecapPhotoFrameLayout(0, 1, 100)).toMatchObject({
      height: 92,
      left: 20,
      rotation: "0deg",
      top: 0,
      width: 74,
    });
    expect(getMessageRecapPhotoGroupSize(1, 100)).toEqual({
      height: 92,
      width: 100,
    });
    expect(getMessageRecapPhotoFrameLayout(0, 2, 100)).toMatchObject({
      height: 76,
      left: 22,
      rotation: "-4deg",
      top: 0,
      width: 52,
    });
    expect(getMessageRecapPhotoFrameLayout(1, 2, 100)).toMatchObject({
      height: 70,
      left: 43,
      rotation: "5deg",
      top: 46,
      width: 50,
    });
    expect(getMessageRecapPhotoGroupSize(2, 100)).toEqual({
      height: 116,
      width: 100,
    });
  });

  it("calculates calendar card and photo slot layouts from canvas width", () => {
    const cardSize = getCalendarRecapCardSize(100);

    expect(cardSize.width).toBe(78);
    expect(cardSize.height).toBeCloseTo(105.3);
    expect(getCalendarRecapPhotoSlotLayout(1, 4, 100)).toMatchObject({
      left: 50,
      rotation: "6deg",
      top: 26,
      zIndex: 7,
    });
  });
});
