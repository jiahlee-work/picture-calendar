import type {
  DailyPhoto,
  DailyPhotoRepository,
} from "@/application/services/daily-photo/types";
import {
  createAutoMonthlyRecapDraft,
  createManualMonthlyRecapDraft,
  shouldRefreshAutoMonthlyRecap,
} from "@/application/services/recap/monthly-recap-layout";
import { sortRecapMonthPhotos } from "@/application/services/recap/monthly-recap-photos";
import { MONTHLY_RECAP_SELECTION_LIMIT } from "@/application/services/recap/recap-selection";
import {
  canCreateRecapForMonth,
  RecapAvailabilityMode,
} from "@/application/services/recap/recap-month-list";
import type { MonthlyRecapRepository } from "@/application/services/recap/types";
import {
  MonthlyRecapSelectionStatus,
  type MonthlyRecap,
} from "@/shared/recap/types";

export const MonthlyRecapDetailStatus = {
  collecting: "collecting",
  empty: "empty",
  error: "error",
  loading: "loading",
  needsSelection: "needs_selection",
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
  recap: MonthlyRecap | null;
  status: LoadedMonthlyRecapDetailStatus;
};

type LoadMonthlyRecapDetailOptions = {
  availabilityMode?: RecapAvailabilityMode;
  currentDate?: Date;
  dailyPhotoRepository: DailyPhotoRepository;
  month: string;
  random?: () => number;
  recapRepository: MonthlyRecapRepository;
  userId: string;
};

export async function loadMonthlyRecapDetail(
  options: LoadMonthlyRecapDetailOptions,
): Promise<MonthlyRecapDetailResult> {
  const {
    availabilityMode = RecapAvailabilityMode.production,
    currentDate,
    dailyPhotoRepository,
    month,
    random,
    recapRepository,
    userId,
  } = options;
  const monthPhotos = sortRecapMonthPhotos(
    await dailyPhotoRepository.listByMonth(userId, month),
  );
  const photoIds = monthPhotos.map((photo) => photo.id);
  const photoIdsSet = new Set(photoIds);
  const savedRecap = await recapRepository.getByMonth(userId, month);
  const savedSelectedPhotoIds =
    savedRecap?.selectionStatus === MonthlyRecapSelectionStatus.selected
      ? savedRecap.selectedPhotoIds.filter((photoId) =>
          photoIdsSet.has(photoId),
        )
      : [];

  if (monthPhotos.length === 0) {
    return {
      photos: [],
      recap: null,
      status: MonthlyRecapDetailStatus.empty,
    };
  }

  if (
    !canCreateRecapForMonth({
      availabilityMode,
      currentDate: currentDate ?? new Date(),
      month,
    })
  ) {
    return {
      photos: monthPhotos,
      recap: savedRecap,
      status: MonthlyRecapDetailStatus.collecting,
    };
  }

  if (
    monthPhotos.length >= MONTHLY_RECAP_SELECTION_LIMIT &&
    savedSelectedPhotoIds.length === 0
  ) {
    return {
      photos: monthPhotos,
      recap: savedRecap,
      status: MonthlyRecapDetailStatus.needsSelection,
    };
  }

  const canUseSavedRecap =
    savedRecap?.selectionStatus === MonthlyRecapSelectionStatus.selected &&
    savedSelectedPhotoIds.length > 0 &&
    !shouldRefreshMonthlyRecap({
      photoIds,
      savedRecap,
      savedSelectedPhotoIds,
    });

  if (canUseSavedRecap) {
    return {
      photos: monthPhotos,
      recap: savedRecap,
      status: MonthlyRecapDetailStatus.ready,
    };
  }

  const draft =
    monthPhotos.length >= MONTHLY_RECAP_SELECTION_LIMIT &&
    savedSelectedPhotoIds.length > 0
      ? createManualMonthlyRecapDraft({
          userId,
          month,
          selectedPhotoIds: savedSelectedPhotoIds,
          random,
        })
      : createAutoMonthlyRecapDraft({
          userId,
          month,
          photoIds,
          random,
        });

  if (!draft) {
    return {
      photos: monthPhotos,
      recap: savedRecap,
      status: MonthlyRecapDetailStatus.needsSelection,
    };
  }

  return {
    photos: monthPhotos,
    recap: await recapRepository.saveSelection(draft),
    status: MonthlyRecapDetailStatus.ready,
  };
}

function shouldRefreshMonthlyRecap({
  photoIds,
  savedRecap,
  savedSelectedPhotoIds,
}: {
  photoIds: string[];
  savedRecap: MonthlyRecap;
  savedSelectedPhotoIds: string[];
}) {
  if (savedSelectedPhotoIds.length !== savedRecap.selectedPhotoIds.length) {
    return true;
  }

  if (photoIds.length >= MONTHLY_RECAP_SELECTION_LIMIT) {
    return false;
  }

  return shouldRefreshAutoMonthlyRecap({
    photoIds,
    selectedPhotoIds: savedSelectedPhotoIds,
  });
}
