import { describe, expect, it } from "vitest";

import {
  createMonthlyRecapNotificationPlan,
  getNextMonthlyRecapNotificationWindow,
  toMonthlyRecapNotificationRoute,
} from "@/application/services/notifications/recap-notification-policy";
import { dayjs } from "@/shared/date/dayjs";

describe("monthly recap notification policy", () => {
  const triggerDate = dayjs("2026-07-01T09:00:00").toDate();

  it("does not notify when there are no recap photos", () => {
    expect(
      createMonthlyRecapNotificationPlan({
        month: "2026-06",
        photoCount: 0,
        triggerDate,
      }),
    ).toBeNull();
  });

  it("always opens the recap detail regardless of photo count", () => {
    const plan = createMonthlyRecapNotificationPlan({
      month: "2026-06",
      photoCount: 12,
      triggerDate,
    });

    expect(plan).toMatchObject({
      body: "6월 리캡이 준비됐어요.",
      destination: "detail",
    });
    expect(toMonthlyRecapNotificationRoute(plan!)).toEqual({
      params: { month: "06", year: "2026" },
      pathname: "/recap/[year]/[month]",
    });
  });

  it("targets the previous month before the monthly trigger", () => {
    expect(
      getNextMonthlyRecapNotificationWindow(
        dayjs("2026-07-01T08:30:00").toDate(),
      ).month,
    ).toBe("2026-06");
  });
});
