import { dayjs } from "@/shared/date/dayjs";

export const CALENDAR_START_MONTH_KEY = "2026-01";
export const CALENDAR_PICKER_FUTURE_YEAR_COUNT = 10;

const CALENDAR_START_MONTH = dayjs(`${CALENDAR_START_MONTH_KEY}-01`).startOf("month");

export type CalendarMonthOption = {
  label: string;
  monthIndex: number;
};

export function addNavigableCalendarMonths(date: Date, amount: number): Date {
  return clampCalendarMonth(dayjs(date).add(amount, "month").startOf("month").toDate());
}

export function canNavigateToCalendarMonth(date: Date): boolean {
  return !dayjs(date).startOf("month").isBefore(CALENDAR_START_MONTH);
}

export function clampCalendarMonth(date: Date): Date {
  const month = dayjs(date).startOf("month");

  if (month.isBefore(CALENDAR_START_MONTH)) {
    return CALENDAR_START_MONTH.toDate();
  }

  return month.toDate();
}

export function createCalendarYearOptions(
  selectedDate: Date,
  today = dayjs().toDate(),
  futureYearCount = CALENDAR_PICKER_FUTURE_YEAR_COUNT,
): number[] {
  const startYear = CALENDAR_START_MONTH.year();
  const maxYear = Math.max(dayjs(selectedDate).year(), dayjs(today).year(), startYear) + futureYearCount;

  return Array.from({ length: maxYear - startYear + 1 }, (_, index) => startYear + index);
}

export function createCalendarMonthOptions(year: number): CalendarMonthOption[] {
  return Array.from({ length: 12 }, (_, monthIndex) => {
    return {
      label: `${monthIndex + 1}월`,
      monthIndex,
    };
  });
}

export function createNavigableCalendarMonth(year: number, monthIndex: number): Date {
  return clampCalendarMonth(dayjs().year(year).month(monthIndex).date(1).startOf("month").toDate());
}
