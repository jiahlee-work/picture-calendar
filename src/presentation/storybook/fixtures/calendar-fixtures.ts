import {
  buildCalendarMonth,
  type CalendarMonth,
} from "@/application/services/calendar/calendar-grid";
import { createDailyPhotoFixture } from "@/presentation/storybook/fixtures/photo-fixtures";

const STORYBOOK_TODAY = new Date(2026, 6, 22);
const STORYBOOK_RECAP_SELECTION_TODAY = new Date(2026, 7, 1);
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
  "2026-07-17",
  "2026-07-31",
];

type CreateStorybookCalendarMonthOptions = {
  today?: Date;
};

export function createStorybookCalendarMonth(
  options: CreateStorybookCalendarMonthOptions = {},
): CalendarMonth {
  const { today = STORYBOOK_TODAY } = options;
  const photosByDate = Object.fromEntries(
    PHOTO_DATES.map((date, index) => [
      date,
      createDailyPhotoFixture(`calendar-${date}`, date, index),
    ]),
  );

  return buildCalendarMonth(STORYBOOK_ACTIVE_MONTH, today, photosByDate);
}

export function createEmptyStorybookCalendarMonth(
  options: CreateStorybookCalendarMonthOptions = {},
): CalendarMonth {
  const { today = STORYBOOK_TODAY } = options;

  return buildCalendarMonth(STORYBOOK_ACTIVE_MONTH, today);
}

export function createRecapSelectionStorybookCalendarMonth(): CalendarMonth {
  return createStorybookCalendarMonth({
    today: STORYBOOK_RECAP_SELECTION_TODAY,
  });
}
