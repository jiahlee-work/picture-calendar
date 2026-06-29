import type { DailyPhotoRepository, DailyPhoto } from "@/application/services/daily-photo/types";
import { sortRecapMonthPhotos } from "@/application/services/recap/monthly-recap-photos";
import type { MonthlyRecapRepository } from "@/application/services/recap/types";
import { toMonthKey } from "@/shared/date/date-key";
import { dayjs } from "@/shared/date/dayjs";

const MONTH_COUNT = 12;
const DEFAULT_PREVIEW_PHOTO_LIMIT = 4;
const DEFAULT_RECAP_START_MONTH = "2026-06";

export type RecapAvailabilityMode = "development" | "production";
export type RecapMonthStatus = "disabled_collecting" | "disabled_empty" | "needs_selection" | "ready_auto" | "selected";

export type RecapMonthSummary = {
  month: string;
  monthLabel: string;
  monthNumber: string;
  photoCount: number;
  previewPhotos: DailyPhoto[];
  selectedPhotoIds: string[];
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
  recapRepository?: MonthlyRecapRepository;
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
      selectedPhotoIds: [],
      status: "disabled_empty",
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
  availabilityMode = "production",
  currentDate = dayjs().toDate(),
  includeMonthsBeforeStart = false,
  previewPhotoLimit = DEFAULT_PREVIEW_PHOTO_LIMIT,
  recapRepository,
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
      const recap = await recapRepository?.getByMonth(userId, month.month);
      const recapPhotoIds = new Set(recapPhotos.map((photo) => photo.id));
      const selectedPhotoIds = recap?.selectionStatus === "selected"
        ? recap.selectedPhotoIds.filter((photoId) => recapPhotoIds.has(photoId))
        : [];

      return {
        ...month,
        photoCount: recapPhotos.length,
        previewPhotos: recapPhotos.slice(0, previewPhotoLimit),
        selectedPhotoIds,
        status: toRecapMonthStatus({
          availabilityMode,
          currentDate,
          month: month.month,
          photoCount: recapPhotos.length,
          selectedPhotoIds,
        }),
      };
    }),
  );
}

export function createRecapYearOptions(currentYear = dayjs().year()): RecapYearOption[] {
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

  return month <= currentMonth && (includeMonthsBeforeStart || !isBeforeStartMonth);
}

function toRecapMonthStatus({
  availabilityMode,
  currentDate,
  month,
  photoCount,
  selectedPhotoIds,
}: {
  availabilityMode: RecapAvailabilityMode;
  currentDate: Date;
  month: string;
  photoCount: number;
  selectedPhotoIds: string[];
}): RecapMonthStatus {
  if (photoCount === 0) {
    return "disabled_empty";
  }

  if (!canCreateRecapForMonth({ availabilityMode, currentDate, month })) {
    return "disabled_collecting";
  }

  if (selectedPhotoIds.length > 0) {
    return "selected";
  }

  return photoCount < 10 ? "ready_auto" : "needs_selection";
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

  return availabilityMode === "development" ? month <= currentMonth : month < currentMonth;
}
