import { MonthlyRecapTemplateId, type MonthlyRecapSelectionDraft } from "@/application/services/recap/types";
import { MONTHLY_RECAP_SELECTION_LIMIT } from "@/application/services/recap/recap-selection";

type RandomFn = () => number;

type CreateAutoMonthlyRecapDraftOptions = {
  userId: string;
  month: string;
  photoIds: string[];
  random?: RandomFn;
};

type CreateManualMonthlyRecapDraftOptions = {
  userId: string;
  month: string;
  selectedPhotoIds: string[];
  random?: RandomFn;
};

export function createAutoMonthlyRecapDraft(
  options: CreateAutoMonthlyRecapDraftOptions,
): MonthlyRecapSelectionDraft | null {
  const { month, random = Math.random, userId } = options;
  const selectedPhotoIds = toUniquePhotoIds(options.photoIds);

  if (selectedPhotoIds.length === 0 || selectedPhotoIds.length >= MONTHLY_RECAP_SELECTION_LIMIT) {
    return null;
  }

  if (selectedPhotoIds.length <= 3) {
    return {
      userId,
      month,
      selectedPhotoIds,
      templateId: MonthlyRecapTemplateId.message,
      calendarPhotoIds: [],
      backgroundPhotoIds: [],
    };
  }

  const [backgroundPhotoId] = pickRandomPhotoIds(selectedPhotoIds, 1, random);

  return {
    userId,
    month,
    selectedPhotoIds,
    templateId: MonthlyRecapTemplateId.calendarCollage,
    calendarPhotoIds: selectedPhotoIds.filter((photoId) => photoId !== backgroundPhotoId),
    backgroundPhotoIds: [backgroundPhotoId],
  };
}

export function createManualMonthlyRecapDraft(
  options: CreateManualMonthlyRecapDraftOptions,
): MonthlyRecapSelectionDraft {
  const { month, random = Math.random, userId } = options;
  const selectedPhotoIds = toUniquePhotoIds(options.selectedPhotoIds).slice(0, MONTHLY_RECAP_SELECTION_LIMIT);
  const calendarPhotoIds = pickRandomPhotoIds(selectedPhotoIds, 4, random);
  const calendarPhotoIdsSet = new Set(calendarPhotoIds);

  return {
    userId,
    month,
    selectedPhotoIds,
    templateId: MonthlyRecapTemplateId.calendarCollage,
    calendarPhotoIds,
    backgroundPhotoIds: selectedPhotoIds.filter((photoId) => !calendarPhotoIdsSet.has(photoId)),
  };
}

export function shouldRefreshAutoMonthlyRecap({
  photoIds,
  selectedPhotoIds,
}: {
  photoIds: string[];
  selectedPhotoIds: string[];
}): boolean {
  const currentPhotoIds = toUniquePhotoIds(photoIds);
  const currentPhotoIdsSet = new Set(currentPhotoIds);
  const currentSelectedPhotoIds = toUniquePhotoIds(selectedPhotoIds).filter((photoId) => currentPhotoIdsSet.has(photoId));

  if (currentPhotoIds.length === 0 || currentPhotoIds.length >= MONTHLY_RECAP_SELECTION_LIMIT) {
    return false;
  }

  return currentPhotoIds.length !== currentSelectedPhotoIds.length
    || currentPhotoIds.some((photoId, index) => currentSelectedPhotoIds[index] !== photoId);
}

function pickRandomPhotoIds(photoIds: string[], limit: number, random: RandomFn): string[] {
  return shufflePhotoIds(photoIds, random).slice(0, Math.min(limit, photoIds.length));
}

function shufflePhotoIds(photoIds: string[], random: RandomFn): string[] {
  const nextPhotoIds = [...photoIds];

  for (let index = nextPhotoIds.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(clampRandom(random()) * (index + 1));
    const currentPhotoId = nextPhotoIds[index];

    nextPhotoIds[index] = nextPhotoIds[swapIndex];
    nextPhotoIds[swapIndex] = currentPhotoId;
  }

  return nextPhotoIds;
}

function clampRandom(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(value, 0.999999999));
}

function toUniquePhotoIds(photoIds: string[]): string[] {
  return Array.from(new Set(photoIds));
}
