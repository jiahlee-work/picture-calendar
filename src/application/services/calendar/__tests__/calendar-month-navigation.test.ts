import { describe, expect, it } from "vitest";

import {
  addNavigableCalendarMonths,
  CALENDAR_START_MONTH_KEY,
  canNavigateToCalendarMonth,
  clampCalendarMonth,
  createCalendarMonthOptions,
  createCalendarYearOptions,
  createNavigableCalendarMonth,
} from "@/application/services/calendar/calendar-month-navigation";
import { toMonthKey } from "@/shared/date/date-key";
import { dayjs } from "@/shared/date/dayjs";

describe("calendar month navigation", () => {
  it("clamps months before the calendar start month", () => {
    const clampedMonth = clampCalendarMonth(dayjs("2025-12-01").toDate());

    expect(toMonthKey(clampedMonth)).toBe(CALENDAR_START_MONTH_KEY);
  });

  it("prevents previous navigation before January 2026", () => {
    const previousMonth = addNavigableCalendarMonths(
      dayjs("2026-01-01").toDate(),
      -1,
    );

    expect(toMonthKey(previousMonth)).toBe("2026-01");
  });

  it("allows January 2026 and later months", () => {
    expect(canNavigateToCalendarMonth(dayjs("2026-01-01").toDate())).toBe(true);
    expect(canNavigateToCalendarMonth(dayjs("2026-06-01").toDate())).toBe(true);
    expect(canNavigateToCalendarMonth(dayjs("2027-01-01").toDate())).toBe(true);
    expect(canNavigateToCalendarMonth(dayjs("2025-12-01").toDate())).toBe(
      false,
    );
  });

  it("creates picker years from 2026 through future years", () => {
    const years = createCalendarYearOptions(
      dayjs("2026-01-01").toDate(),
      dayjs("2026-06-29").toDate(),
      2,
    );

    expect(years).toEqual([2026, 2027, 2028]);
  });

  it("shows every month for the start year", () => {
    const monthOptions = createCalendarMonthOptions(2026);

    expect(monthOptions[0]).toEqual({ label: "1월", monthIndex: 0 });
    expect(monthOptions.at(-1)).toEqual({ label: "12월", monthIndex: 11 });
    expect(monthOptions).toHaveLength(12);
  });

  it("shows every month after the start year", () => {
    const monthOptions = createCalendarMonthOptions(2027);

    expect(monthOptions[0]).toEqual({ label: "1월", monthIndex: 0 });
    expect(monthOptions).toHaveLength(12);
  });

  it("creates a clamped month from selected year and month", () => {
    const selectedMonth = createNavigableCalendarMonth(2025, 11);

    expect(toMonthKey(selectedMonth)).toBe("2026-01");
  });
});
