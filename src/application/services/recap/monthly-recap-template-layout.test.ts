import { describe, expect, it } from "vitest";

import {
  getCalendarRecapCardSize,
  getCalendarRecapPhotoSlotLayout,
  getMessageRecapBubbleTop,
  getMessageRecapPhotoFrameLayout,
  getMonthlyRecapStatusLabel,
} from "@/application/services/recap/monthly-recap-template-layout";

describe("monthly recap template layout", () => {
  it("creates status labels for loading and ready recap states", () => {
    expect(getMonthlyRecapStatusLabel({
      photoCount: 0,
      status: "loading",
      templateId: null,
    })).toBe("이 달의 리캡을 불러오는 중이에요.");
    expect(getMonthlyRecapStatusLabel({
      photoCount: 3,
      status: "ready",
      templateId: "message",
    })).toBe("3장의 사진으로 메시지 리캡을 준비했어요.");
  });

  it("places the message bubble after the photo stack", () => {
    expect(getMessageRecapPhotoFrameLayout(0, 2, 100)).toMatchObject({
      height: 92,
      rotation: "-4deg",
      top: 48,
    });
    expect(getMessageRecapBubbleTop(2, 100)).toBe(225);
  });

  it("calculates calendar card and photo slot layouts from canvas width", () => {
    expect(getCalendarRecapCardSize(100)).toEqual({
      height: 59,
      width: 78,
    });
    expect(getCalendarRecapPhotoSlotLayout(1, 4, 100)).toMatchObject({
      left: 50,
      rotation: "6deg",
      top: 26,
      zIndex: 7,
    });
  });
});
