import type { DailyPhotoRepository, DailyPhoto } from "@/application/services/daily-photo/types";
import {
  isDevelopmentSampleStorageKey,
  isDisplayableDailyPhoto,
} from "@/application/services/daily-photo/daily-photo-records";
import type { MonthlyRecapRepository } from "@/application/services/recap/types";
import { toMonthKey } from "@/shared/date/date-key";
import { dayjs } from "@/shared/date/dayjs";

const monthCount = 12;
const defaultPreviewPhotoLimit = 4;
const defaultRecapStartMonth = "2026-06";

export type RecapMonthStatus = "disabled" | "needs_selection" | "selected";

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
  return Array.from({ length: monthCount }, (_, index) => {
    const monthNumber = String(index + 1).padStart(2, "0");
    const monthDate = dayjs(`${year}-${monthNumber}-01`).toDate();

    return {
      month: toMonthKey(monthDate),
      monthLabel: dayjs(monthDate).format("MMMM"),
      monthNumber,
      photoCount: 0,
      previewPhotos: [],
      selectedPhotoIds: [],
      status: "disabled",
      year,
    };
  });
}

export function createVisibleRecapYearMonths({
  currentDate = dayjs().toDate(),
  includeMonthsBeforeStart = false,
  startMonth = defaultRecapStartMonth,
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
  currentDate = dayjs().toDate(),
  includeMonthsBeforeStart = false,
  previewPhotoLimit = defaultPreviewPhotoLimit,
  recapRepository,
  repository,
  startMonth = defaultRecapStartMonth,
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
      const sortedPhotos = [...photos].sort((firstPhoto, secondPhoto) => firstPhoto.date.localeCompare(secondPhoto.date));
      const recapPhotos = sortedPhotos.filter(isRecapPreviewPhoto);
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
        status: toRecapMonthStatus(recapPhotos.length, selectedPhotoIds),
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

function isRecapPreviewPhoto(photo: DailyPhoto): boolean {
  if (!isDisplayableDailyPhoto(photo)) {
    return false;
  }

  return !photo.storageKey || !isDevelopmentSampleStorageKey(photo.storageKey);
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

function toRecapMonthStatus(photoCount: number, selectedPhotoIds: string[]): RecapMonthStatus {
  if (photoCount === 0) {
    return "disabled";
  }

  return selectedPhotoIds.length > 0 ? "selected" : "needs_selection";
}
