import { describe, expect, it } from "vitest";

import {
  createMonthlyRecapNotificationPlan,
  getNextMonthlyRecapNotificationWindow,
} from "@/application/services/notifications/recap-notification-policy";
import { dayjs } from "@/shared/date/dayjs";

describe("monthly recap notification policy", () => {
  const triggerDate = dayjs("2026-07-01T09:00:00").toDate();

  it("does not create a notification for the previous month when there are no recap photos", () => {
    expect(createMonthlyRecapNotificationPlan({
      hasSelectedRecap: false,
      month: "2026-06",
      photoCount: 0,
      triggerDate,
    })).toBeNull();
  });

  it("routes one to nine previous-month photos to the recap detail", () => {
    const plan = createMonthlyRecapNotificationPlan({
      hasSelectedRecap: false,
      month: "2026-06",
      photoCount: 9,
      triggerDate,
    });

    expect(plan).toMatchObject({
      body: "6월 리캡이 준비됐어요.",
      destination: "detail",
      month: "2026-06",
    });
  });

  it("routes ten or more unselected previous-month photos to representative photo selection", () => {
    const plan = createMonthlyRecapNotificationPlan({
      hasSelectedRecap: false,
      month: "2026-06",
      photoCount: 10,
      triggerDate,
    });

    expect(plan).toMatchObject({
      body: "6월의 대표 사진 10장을 골라볼까요?",
      destination: "select",
      month: "2026-06",
    });
  });

  it("routes ten or more previous-month photos with a selected recap to the detail", () => {
    const plan = createMonthlyRecapNotificationPlan({
      hasSelectedRecap: true,
      month: "2026-06",
      photoCount: 12,
      triggerDate,
    });

    expect(plan).toMatchObject({
      body: "6월 리캡이 준비됐어요.",
      destination: "detail",
    });
  });

  it("routes an already automatic recap month to the detail", () => {
    const plan = createMonthlyRecapNotificationPlan({
      hasSelectedRecap: true,
      month: "2026-06",
      photoCount: 6,
      triggerDate,
    });

    expect(plan?.destination).toBe("detail");
  });

  it("includes the actual month label in notification copy", () => {
    const plan = createMonthlyRecapNotificationPlan({
      hasSelectedRecap: false,
      month: "2026-05",
      photoCount: 10,
      triggerDate,
    });

    expect(plan?.body).toContain("5월");
  });

  it("targets the previous month when opened before this month's first 9 AM trigger", () => {
    expect(getNextMonthlyRecapNotificationWindow(dayjs("2026-07-01T08:30:00").toDate())).toMatchObject({
      month: "2026-06",
    });
  });

  it("targets the current month for next month's first 9 AM trigger after this month's trigger time", () => {
    expect(getNextMonthlyRecapNotificationWindow(dayjs("2026-07-01T09:00:00").toDate())).toMatchObject({
      month: "2026-07",
    });
  });
});
