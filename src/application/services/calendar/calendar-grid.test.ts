import { describe, expect, it } from "vitest";

import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import { dayjs } from "@/shared/date/dayjs";

describe("buildCalendarMonth", () => {
  it("builds the current month grid without sample photos", () => {
    const calendar = buildCalendarMonth(dayjs("2026-04-01").toDate(), dayjs("2026-04-09").toDate());
    const realDays = calendar.days.filter(Boolean);

    expect(calendar.title).toBe("Apr 2026");
    expect(realDays).toHaveLength(30);
    expect(realDays[0]?.dayOfMonth).toBe(1);
    expect(realDays[0]?.photo).toBeNull();
    expect(realDays.every((day) => day?.photo === null)).toBe(true);
  });

  it("injects photos by date key", () => {
    const photo: DailyPhoto = {
      id: "photo-1",
      userId: "user-1",
      date: "2026-04-09",
      imagePath: "file://photo.jpg",
      localImagePath: "file://photo.jpg",
      remoteImageUrl: null,
      storageKey: "user-1/2026-04-09.jpg",
      syncStatus: "local",
      createdAt: "2026-04-09T00:00:00.000Z",
      updatedAt: "2026-04-09T00:00:00.000Z",
      lockedAt: null,
    };

    const calendar = buildCalendarMonth(dayjs("2026-04-01").toDate(), dayjs("2026-04-09").toDate(), {
      [photo.date]: photo,
    });
    const photoDay = calendar.days.find((day) => day?.key === photo.date);

    expect(photoDay?.photo).toEqual(photo);
    expect(photoDay?.isToday).toBe(true);
  });
});
