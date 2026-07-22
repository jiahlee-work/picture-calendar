import {
  buildCalendarMonth,
  type CalendarMonth,
} from "@/application/services/calendar/calendar-grid";
import { createDailyPhotoFixture } from "@/presentation/storybook/photo-fixtures";

const STORYBOOK_TODAY = new Date(2026, 6, 22);
const STORYBOOK_ACTIVE_MONTH = new Date(2026, 6, 1);

const PHOTO_DATES = [
  "2026-07-02",
  "2026-07-04",
  "2026-07-08",
  "2026-07-13",
  "2026-07-17",
  "2026-07-22",
  "2026-07-27",
  "2026-07-31",
];

export const selectedStorybookDateKeys = [
  "2026-07-04",
  "2026-07-13",
  "2026-07-22",
  "2026-07-31",
];

export function createStorybookCalendarMonth(): CalendarMonth {
  const photosByDate = Object.fromEntries(
    PHOTO_DATES.map((date, index) => [
      date,
      createDailyPhotoFixture(`calendar-${date}`, date, index),
    ]),
  );

  return buildCalendarMonth(
    STORYBOOK_ACTIVE_MONTH,
    STORYBOOK_TODAY,
    photosByDate,
  );
}

export function createEmptyStorybookCalendarMonth(): CalendarMonth {
  return buildCalendarMonth(STORYBOOK_ACTIVE_MONTH, STORYBOOK_TODAY);
}
