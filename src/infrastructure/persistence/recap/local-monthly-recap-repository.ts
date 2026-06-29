import type {
  MonthlyRecap,
  MonthlyRecapMetadataStore,
  MonthlyRecapRepository,
  MonthlyRecapSelectionDraft,
  MonthlyRecapSelectionStatus,
  MonthlyRecapTemplateId,
} from "@/shared/recap/types";
import {
  MonthlyRecapSelectionStatus as MonthlyRecapSelectionStatusValue,
  MonthlyRecapTemplateId as MonthlyRecapTemplateIdValue,
} from "@/shared/recap/types";
import { dayjs } from "@/shared/date/dayjs";

const MONTHLY_RECAP_SELECTION_LIMIT = 10;

type LocalMonthlyRecapRepositoryOptions = {
  initialRecaps?: MonthlyRecap[];
  metadataStore?: MonthlyRecapMetadataStore;
  now?: () => Date;
};

export function createLocalMonthlyRecapRepository(
  options: LocalMonthlyRecapRepositoryOptions | MonthlyRecap[] = [],
): MonthlyRecapRepository {
  const normalizedOptions = Array.isArray(options) ? { initialRecaps: options } : options;
  const metadataStore = normalizedOptions.metadataStore ?? createMemoryMonthlyRecapMetadataStore(normalizedOptions.initialRecaps ?? []);
  const now = normalizedOptions.now ?? (() => dayjs().toDate());

  return {
    async getByMonth(userId, month) {
      const recapsByUserMonth = await loadRecapsByUserMonth(metadataStore);

      return recapsByUserMonth.get(toMonthlyRecapKey(userId, month)) ?? null;
    },
    async listByYear(userId, year) {
      const recapsByUserMonth = await loadRecapsByUserMonth(metadataStore);

      return Array.from(recapsByUserMonth.values())
        .filter((recap) => recap.userId === userId && recap.month.startsWith(year))
        .sort((left, right) => left.month.localeCompare(right.month));
    },
    async markPrompted(userId, month) {
      return upsertMonthlyRecap(metadataStore, now, {
        userId,
        month,
        selectedPhotoIds: undefined,
        status: MonthlyRecapSelectionStatusValue.prompted,
        promptedAt: now().toISOString(),
      });
    },
    async saveSelection(selection) {
      const selectedPhotoIds = toSelectedPhotoIds(selection);

      return upsertMonthlyRecap(metadataStore, now, {
        userId: selection.userId,
        month: selection.month,
        selectedPhotoIds,
        templateId: selection.templateId ?? toDefaultTemplateId(selectedPhotoIds),
        calendarPhotoIds: toLayoutPhotoIds(selection.calendarPhotoIds ?? [], selectedPhotoIds),
        backgroundPhotoIds: toLayoutPhotoIds(selection.backgroundPhotoIds ?? [], selectedPhotoIds),
        status: MonthlyRecapSelectionStatusValue.selected,
        completedAt: now().toISOString(),
      });
    },
    async skipSelection(userId, month) {
      return upsertMonthlyRecap(metadataStore, now, {
        userId,
        month,
        selectedPhotoIds: [],
        templateId: MonthlyRecapTemplateIdValue.message,
        calendarPhotoIds: [],
        backgroundPhotoIds: [],
        status: MonthlyRecapSelectionStatusValue.skipped,
        completedAt: now().toISOString(),
      });
    },
  };
}

function createMemoryMonthlyRecapMetadataStore(initialRecaps: MonthlyRecap[]): MonthlyRecapMetadataStore {
  let recaps = [...initialRecaps];

  return {
    async load() {
      return recaps;
    },
    async save(nextRecaps) {
      recaps = [...nextRecaps];
    },
  };
}

async function loadRecapsByUserMonth(metadataStore: MonthlyRecapMetadataStore): Promise<Map<string, MonthlyRecap>> {
  const recaps = await metadataStore.load();

  return new Map(recaps.map((recap) => [toMonthlyRecapKey(recap.userId, recap.month), recap]));
}

async function upsertMonthlyRecap(
  metadataStore: MonthlyRecapMetadataStore,
  now: () => Date,
  update: {
    userId: string;
    month: string;
    selectedPhotoIds?: string[];
    templateId?: MonthlyRecapTemplateId;
    calendarPhotoIds?: string[];
    backgroundPhotoIds?: string[];
    status: MonthlyRecapSelectionStatus;
    promptedAt?: string;
    completedAt?: string;
  },
): Promise<MonthlyRecap> {
  const recapsByUserMonth = await loadRecapsByUserMonth(metadataStore);
  const recapKey = toMonthlyRecapKey(update.userId, update.month);
  const existing = recapsByUserMonth.get(recapKey);
  const timestamp = now().toISOString();
  const nextRecap = createMonthlyRecap(update, existing, timestamp);

  recapsByUserMonth.set(recapKey, nextRecap);
  await metadataStore.save(Array.from(recapsByUserMonth.values()));

  return nextRecap;
}

function createMonthlyRecap(
  update: {
    userId: string;
    month: string;
    selectedPhotoIds?: string[];
    templateId?: MonthlyRecapTemplateId;
    calendarPhotoIds?: string[];
    backgroundPhotoIds?: string[];
    status: MonthlyRecapSelectionStatus;
    promptedAt?: string;
    completedAt?: string;
  },
  existing: MonthlyRecap | undefined,
  now: string,
): MonthlyRecap {
  const selectionStatus = shouldKeepExistingSelectionStatus(existing, update.status) && existing
    ? existing.selectionStatus
    : update.status;

  return {
    id: existing?.id ?? `local-recap-${update.month}`,
    userId: update.userId,
    month: update.month,
    selectedPhotoIds: update.selectedPhotoIds ?? existing?.selectedPhotoIds ?? [],
    templateId: update.templateId ?? existing?.templateId ?? toDefaultTemplateId(update.selectedPhotoIds ?? existing?.selectedPhotoIds ?? []),
    calendarPhotoIds: update.calendarPhotoIds ?? existing?.calendarPhotoIds ?? [],
    backgroundPhotoIds: update.backgroundPhotoIds ?? existing?.backgroundPhotoIds ?? [],
    selectionStatus,
    promptedAt: update.promptedAt ?? existing?.promptedAt ?? null,
    completedAt: update.completedAt ?? existing?.completedAt ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function shouldKeepExistingSelectionStatus(
  existing: MonthlyRecap | undefined,
  nextStatus: MonthlyRecapSelectionStatus,
) {
  return nextStatus === MonthlyRecapSelectionStatusValue.prompted
    && (
      existing?.selectionStatus === MonthlyRecapSelectionStatusValue.selected
      || existing?.selectionStatus === MonthlyRecapSelectionStatusValue.skipped
    );
}

function toSelectedPhotoIds(selection: MonthlyRecapSelectionDraft) {
  return Array.from(new Set(selection.selectedPhotoIds)).slice(0, MONTHLY_RECAP_SELECTION_LIMIT);
}

function toLayoutPhotoIds(photoIds: string[], selectedPhotoIds: string[]): string[] {
  const selectedPhotoIdsSet = new Set(selectedPhotoIds);

  return Array.from(new Set(photoIds)).filter((photoId) => selectedPhotoIdsSet.has(photoId));
}

function toDefaultTemplateId(selectedPhotoIds: string[]): MonthlyRecapTemplateId {
  return selectedPhotoIds.length > 0 && selectedPhotoIds.length <= 3
    ? MonthlyRecapTemplateIdValue.message
    : MonthlyRecapTemplateIdValue.calendarCollage;
}

function toMonthlyRecapKey(userId: string, month: string): string {
  return `${userId}:${month}`;
}
