import { Directory, File, Paths } from "expo-file-system";

import type {
  MonthlyRecap,
  MonthlyRecapMetadataStore,
  MonthlyRecapSelectionStatus,
} from "@/shared/recap/types";

const monthlyRecapsDirectoryName = "monthly-recaps";
const metadataFileName = "metadata.json";

export function createLocalMonthlyRecapMetadataStore(): MonthlyRecapMetadataStore {
  const directory = new Directory(Paths.document, monthlyRecapsDirectoryName);
  const file = new File(directory, metadataFileName);

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

  return {
    id,
    userId,
    month,
    selectedPhotoIds: stringArrayValue(value.selectedPhotoIds),
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
  if (value === "prompted" || value === "selected" || value === "skipped") {
    return value;
  }

  return "not_started";
}
