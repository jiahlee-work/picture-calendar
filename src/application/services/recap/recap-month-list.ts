import type {
  DailyPhotoRepository,
  DailyPhoto,
} from "@/application/services/daily-photo/types";
import { sortRecapMonthPhotos } from "@/application/services/recap/monthly-recap-photos";
import { toMonthKey } from "@/shared/date/date-key";
import { dayjs } from "@/shared/date/dayjs";

const MONTH_COUNT = 12;
const DEFAULT_PREVIEW_PHOTO_LIMIT = 4;
const DEFAULT_RECAP_START_MONTH = "2026-06";

export const RecapAvailabilityMode = {
  development: "development",
  production: "production",
} as const;

export type RecapAvailabilityMode =
  (typeof RecapAvailabilityMode)[keyof typeof RecapAvailabilityMode];

export const RecapMonthStatus = {
  disabledCollecting: "disabled_collecting",
  disabledEmpty: "disabled_empty",
  ready: "ready",
} as const;

export type RecapMonthStatus =
  (typeof RecapMonthStatus)[keyof typeof RecapMonthStatus];

export type RecapMonthSummary = {
  month: string;
  monthLabel: string;
  monthNumber: string;
  photoCount: number;
  previewPhotos: DailyPhoto[];
  status: RecapMonthStatus;
  year: number;
};

export type RecapYearOption = {
  label: string;
  year: number;
};

type CreateRecapMonthSummariesOptions = {
  availabilityMode?: RecapAvailabilityMode;
  currentDate?: Date;
  includeMonthsBeforeStart?: boolean;
  previewPhotoLimit?: number;
  repository: DailyPhotoRepository;
  startMonth?: string;
  userId: string;
  year: number;
};

export function createRecapYearMonths(year: number): RecapMonthSummary[] {
  return Array.from({ length: MONTH_COUNT }, (_, index) => {
    const monthNumber = String(index + 1).padStart(2, "0");
    const monthDate = dayjs(`${year}-${monthNumber}-01`).toDate();

    return {
      month: toMonthKey(monthDate),
      monthLabel: dayjs(monthDate).format("MMMM"),
      monthNumber,
      photoCount: 0,
      previewPhotos: [],
      status: RecapMonthStatus.disabledEmpty,
      year,
    };
  });
}

export function createVisibleRecapYearMonths({
  currentDate = dayjs().toDate(),
  includeMonthsBeforeStart = false,
  startMonth = DEFAULT_RECAP_START_MONTH,
  year,
}: {
  currentDate?: Date;
  includeMonthsBeforeStart?: boolean;
  startMonth?: string;
  year: number;
}): RecapMonthSummary[] {
  return createRecapYearMonths(year).filter((month) =>
    isVisibleRecapMonth({
      currentDate,
      includeMonthsBeforeStart,
      month: month.month,
      startMonth,
    }),
  );
}

export async function createRecapMonthSummaries({
  availabilityMode = RecapAvailabilityMode.production,
  currentDate = dayjs().toDate(),
  includeMonthsBeforeStart = false,
  previewPhotoLimit = DEFAULT_PREVIEW_PHOTO_LIMIT,
  repository,
  startMonth = DEFAULT_RECAP_START_MONTH,
  userId,
  year,
}: CreateRecapMonthSummariesOptions): Promise<RecapMonthSummary[]> {
  const months = createVisibleRecapYearMonths({
    currentDate,
    includeMonthsBeforeStart,
    startMonth,
    year,
  });

  return Promise.all(
    months.map(async (month) => {
      const photos = await repository.listByMonth(userId, month.month);
      const recapPhotos = sortRecapMonthPhotos(photos);
      const previewPhotos = recapPhotos.slice(0, previewPhotoLimit);

      return {
        ...month,
        photoCount: recapPhotos.length,
        previewPhotos,
        status: toRecapMonthStatus({
          availabilityMode,
          currentDate,
          month: month.month,
          photoCount: recapPhotos.length,
        }),
      };
    }),
  );
}

export function createRecapYearOptions(
  currentYear = dayjs().year(),
): RecapYearOption[] {
  return [
    {
      label: String(currentYear),
      year: currentYear,
    },
  ];
}

function isVisibleRecapMonth({
  currentDate,
  includeMonthsBeforeStart,
  month,
  startMonth,
}: {
  currentDate: Date;
  includeMonthsBeforeStart: boolean;
  month: string;
  startMonth: string;
}) {
  const currentMonth = toMonthKey(dayjs(currentDate).startOf("month").toDate());
  const isBeforeStartMonth = month < startMonth;

  return (
    month <= currentMonth && (includeMonthsBeforeStart || !isBeforeStartMonth)
  );
}

function toRecapMonthStatus({
  availabilityMode,
  currentDate,
  month,
  photoCount,
}: {
  availabilityMode: RecapAvailabilityMode;
  currentDate: Date;
  month: string;
  photoCount: number;
}): RecapMonthStatus {
  if (photoCount === 0) {
    return RecapMonthStatus.disabledEmpty;
  }

  if (!canCreateRecapForMonth({ availabilityMode, currentDate, month })) {
    return RecapMonthStatus.disabledCollecting;
  }

  return RecapMonthStatus.ready;
}

export function canCreateRecapForMonth({
  availabilityMode,
  currentDate,
  month,
}: {
  availabilityMode: RecapAvailabilityMode;
  currentDate: Date;
  month: string;
}): boolean {
  const currentMonth = toMonthKey(dayjs(currentDate).startOf("month").toDate());

  return availabilityMode === RecapAvailabilityMode.development
    ? month <= currentMonth
    : month < currentMonth;
}
