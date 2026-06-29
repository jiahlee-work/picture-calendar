import { Directory, File, Paths } from "expo-file-system";

import type {
  MonthlyRecap,
  MonthlyRecapMetadataStore,
  MonthlyRecapSelectionStatus,
  MonthlyRecapTemplateId,
} from "@/shared/recap/types";
import {
  MonthlyRecapSelectionStatus as MonthlyRecapSelectionStatusValue,
  MonthlyRecapTemplateId as MonthlyRecapTemplateIdValue,
} from "@/shared/recap/types";

const MONTHLY_RECAPS_DIRECTORY_NAME = "monthly-recaps";
const METADATA_FILE_NAME = "metadata.json";

export function createLocalMonthlyRecapMetadataStore(): MonthlyRecapMetadataStore {
  const directory = new Directory(Paths.document, MONTHLY_RECAPS_DIRECTORY_NAME);
  const file = new File(directory, METADATA_FILE_NAME);

  return {
    async load() {
      if (!file.exists) {
        return [];
      }

      const contents = await file.text();

      if (!contents.trim()) {
        return [];
      }

      const parsed = JSON.parse(contents);

      return Array.isArray(parsed) ? parsed.map(toMonthlyRecap).filter(isMonthlyRecap) : [];
    },
    async save(recaps) {
      directory.create({
        idempotent: true,
        intermediates: true,
      });

      if (!file.exists) {
        file.create({
          intermediates: true,
          overwrite: true,
        });
      }

      file.write(JSON.stringify(recaps, null, 2));
    },
  };
}

function isMonthlyRecap(recap: MonthlyRecap | null): recap is MonthlyRecap {
  return recap !== null;
}

function toMonthlyRecap(value: unknown): MonthlyRecap | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const id = stringValue(value.id);
  const userId = stringValue(value.userId);
  const month = stringValue(value.month);
  const createdAt = stringValue(value.createdAt);
  const updatedAt = stringValue(value.updatedAt);

  if (!id || !userId || !month || !createdAt || !updatedAt) {
    return null;
  }

  const selectedPhotoIds = stringArrayValue(value.selectedPhotoIds);

  return {
    id,
    userId,
    month,
    selectedPhotoIds,
    templateId: templateIdValue(value.templateId, selectedPhotoIds),
    calendarPhotoIds: stringArrayValue(value.calendarPhotoIds),
    backgroundPhotoIds: stringArrayValue(value.backgroundPhotoIds),
    selectionStatus: selectionStatusValue(value.selectionStatus),
    promptedAt: stringValue(value.promptedAt),
    completedAt: stringValue(value.completedAt),
    createdAt,
    updatedAt,
  };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function stringArrayValue(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function selectionStatusValue(value: unknown): MonthlyRecapSelectionStatus {
  if (
    value === MonthlyRecapSelectionStatusValue.prompted
    || value === MonthlyRecapSelectionStatusValue.selected
    || value === MonthlyRecapSelectionStatusValue.skipped
  ) {
    return value;
  }

  return MonthlyRecapSelectionStatusValue.notStarted;
}

function templateIdValue(value: unknown, selectedPhotoIds: string[]): MonthlyRecapTemplateId {
  if (value === MonthlyRecapTemplateIdValue.message || value === MonthlyRecapTemplateIdValue.calendarCollage) {
    return value;
  }

  return selectedPhotoIds.length > 0 && selectedPhotoIds.length <= 3
    ? MonthlyRecapTemplateIdValue.message
    : MonthlyRecapTemplateIdValue.calendarCollage;
}
