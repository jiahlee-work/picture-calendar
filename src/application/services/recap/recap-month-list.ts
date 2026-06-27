import type { DailyPhotoRepository, DailyPhoto } from "@/application/services/daily-photo/types";
import { toMonthKey } from "@/shared/date/date-key";
import { dayjs } from "@/shared/date/dayjs";

const monthCount = 12;
const defaultPreviewPhotoLimit = 4;

export type RecapMonthSummary = {
  month: string;
  monthLabel: string;
  monthNumber: string;
  photoCount: number;
  previewPhotos: DailyPhoto[];
  year: number;
};

export type RecapYearOption = {
  label: string;
  year: number;
};

type CreateRecapMonthSummariesOptions = {
  previewPhotoLimit?: number;
  repository: DailyPhotoRepository;
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
      year,
    };
  });
}

export async function createRecapMonthSummaries({
  previewPhotoLimit = defaultPreviewPhotoLimit,
  repository,
  userId,
  year,
}: CreateRecapMonthSummariesOptions): Promise<RecapMonthSummary[]> {
  const months = createRecapYearMonths(year);

  return Promise.all(
    months.map(async (month) => {
      const photos = await repository.listByMonth(userId, month.month);
      const sortedPhotos = [...photos].sort((firstPhoto, secondPhoto) => firstPhoto.date.localeCompare(secondPhoto.date));

      return {
        ...month,
        photoCount: sortedPhotos.length,
        previewPhotos: sortedPhotos.slice(0, previewPhotoLimit),
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
