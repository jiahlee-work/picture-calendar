import type {
  DailyPhoto,
  DailyPhotoRepository,
} from "@/application/services/daily-photo/types";
import { sortRecapMonthPhotos } from "@/application/services/recap/monthly-recap-photos";
import {
  canCreateRecapForMonth,
  RecapAvailabilityMode,
} from "@/application/services/recap/recap-month-list";

export const MonthlyRecapDetailStatus = {
  collecting: "collecting",
  empty: "empty",
  error: "error",
  loading: "loading",
  ready: "ready",
} as const;

export type MonthlyRecapDetailStatus =
  (typeof MonthlyRecapDetailStatus)[keyof typeof MonthlyRecapDetailStatus];

export type LoadedMonthlyRecapDetailStatus = Exclude<
  MonthlyRecapDetailStatus,
  | typeof MonthlyRecapDetailStatus.error
  | typeof MonthlyRecapDetailStatus.loading
>;

export type MonthlyRecapDetailResult = {
  photos: DailyPhoto[];
  status: LoadedMonthlyRecapDetailStatus;
};

type LoadMonthlyRecapDetailOptions = {
  availabilityMode?: RecapAvailabilityMode;
  currentDate?: Date;
  dailyPhotoRepository: DailyPhotoRepository;
  month: string;
  userId: string;
};

export async function loadMonthlyRecapDetail({
  availabilityMode = RecapAvailabilityMode.production,
  currentDate = new Date(),
  dailyPhotoRepository,
  month,
  userId,
}: LoadMonthlyRecapDetailOptions): Promise<MonthlyRecapDetailResult> {
  const photos = sortRecapMonthPhotos(
    await dailyPhotoRepository.listByMonth(userId, month),
  );

  if (photos.length === 0) {
    return { photos, status: MonthlyRecapDetailStatus.empty };
  }

  if (!canCreateRecapForMonth({ availabilityMode, currentDate, month })) {
    return { photos, status: MonthlyRecapDetailStatus.collecting };
  }

  return { photos, status: MonthlyRecapDetailStatus.ready };
}
