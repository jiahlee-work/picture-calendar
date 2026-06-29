import type { DailyPhoto, DailyPhotoRepository } from "@/application/services/daily-photo/types";
import {
  createAutoMonthlyRecapDraft,
  createManualMonthlyRecapDraft,
  shouldRefreshAutoMonthlyRecap,
} from "@/application/services/recap/monthly-recap-layout";
import { sortRecapMonthPhotos } from "@/application/services/recap/monthly-recap-photos";
import {
  canCreateRecapForMonth,
  type RecapAvailabilityMode,
} from "@/application/services/recap/recap-month-list";
import type { MonthlyRecapRepository } from "@/application/services/recap/types";
import type { MonthlyRecap } from "@/shared/recap/types";

export type MonthlyRecapDetailStatus = "collecting" | "ready" | "empty" | "needs_selection";

export type MonthlyRecapDetailResult = {
  photos: DailyPhoto[];
  recap: MonthlyRecap | null;
  status: MonthlyRecapDetailStatus;
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
    availabilityMode = "production",
    currentDate,
    dailyPhotoRepository,
    month,
    random,
    recapRepository,
    userId,
  } = options;
  const monthPhotos = sortRecapMonthPhotos(await dailyPhotoRepository.listByMonth(userId, month));
  const photoIds = monthPhotos.map((photo) => photo.id);
  const photoIdsSet = new Set(photoIds);
  const savedRecap = await recapRepository.getByMonth(userId, month);
  const savedSelectedPhotoIds = savedRecap?.selectionStatus === "selected"
    ? savedRecap.selectedPhotoIds.filter((photoId) => photoIdsSet.has(photoId))
    : [];

  if (monthPhotos.length === 0) {
    return {
      photos: [],
      recap: null,
      status: "empty",
    };
  }

  if (!canCreateRecapForMonth({
    availabilityMode,
    currentDate: currentDate ?? new Date(),
    month,
  })) {
    return {
      photos: monthPhotos,
      recap: savedRecap,
      status: "collecting",
    };
  }

  if (monthPhotos.length >= 10 && savedSelectedPhotoIds.length === 0) {
    return {
      photos: monthPhotos,
      recap: savedRecap,
      status: "needs_selection",
    };
  }

  const canUseSavedRecap = savedRecap?.selectionStatus === "selected"
    && savedSelectedPhotoIds.length > 0
    && !shouldRefreshMonthlyRecap({
      photoIds,
      savedRecap,
      savedSelectedPhotoIds,
    });

  if (canUseSavedRecap) {
    return {
      photos: monthPhotos,
      recap: savedRecap,
      status: "ready",
    };
  }

  const draft = monthPhotos.length >= 10 && savedSelectedPhotoIds.length > 0
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
      status: "needs_selection",
    };
  }

  return {
    photos: monthPhotos,
    recap: await recapRepository.saveSelection(draft),
    status: "ready",
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

  if (photoIds.length >= 10) {
    return false;
  }

  return shouldRefreshAutoMonthlyRecap({
    photoIds,
    selectedPhotoIds: savedSelectedPhotoIds,
  });
}
