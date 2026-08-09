import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { toDateKey } from "@/shared/date/date-key";
import { dayjs } from "@/shared/date/dayjs";

export type CalendarDay = {
  key: string;
  date: Date;
  dayOfMonth: number;
  isToday: boolean;
  photo: DailyPhoto | null;
};

export type CalendarGridCell = CalendarDay | null;

export type CalendarMonth = {
  year: number;
  monthIndex: number;
  title: string;
  monthName: string;
  days: CalendarGridCell[];
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type CalendarPhotoMap = Record<string, DailyPhoto>;

export function buildCalendarMonth(
  activeMonth: Date,
  today = dayjs().toDate(),
  photosByDate: CalendarPhotoMap = {},
): CalendarMonth {
  const month = dayjs(activeMonth).startOf("month");
  const year = month.year();
  const monthIndex = month.month();
  const daysInMonth = month.daysInMonth();
  const leadingEmptyCells = month.day();
  const todayKey = toDateKey(today);

  const monthDays = Array.from({ length: daysInMonth }, (_, index) => {
    const dayOfMonth = index + 1;
    const date = month.date(dayOfMonth).toDate();
    const dateKey = toDateKey(date);

    return {
      key: dateKey,
      date,
      dayOfMonth,
      isToday: dateKey === todayKey,
      photo: photosByDate[dateKey] ?? null,
    };
  });

  const cells = [
    ...Array.from<null>({ length: leadingEmptyCells }).fill(null),
    ...monthDays,
  ];
  const trailingEmptyCells = (7 - (cells.length % 7)) % 7;

  return {
    year,
    monthIndex,
    title: `${MONTH_NAMES[monthIndex]} ${year}`,
    monthName: MONTH_NAMES[monthIndex],
    days: [
      ...cells,
      ...Array.from<null>({ length: trailingEmptyCells }).fill(null),
    ],
  };
}

export function addMonths(date: Date, amount: number): Date {
  return dayjs(date).add(amount, "month").startOf("month").toDate();
}
