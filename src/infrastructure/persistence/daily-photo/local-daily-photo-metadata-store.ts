import { Directory, File, Paths } from "expo-file-system";

import { isLegacyDevelopmentDailyPhoto } from "@/shared/daily-photo/legacy-development-photo";
import type { DailyPhoto, DailyPhotoMetadataStore, DailyPhotoSyncStatus } from "@/shared/daily-photo/types";

const dailyPhotosDirectoryName = "daily-photos";
const metadataFileName = "metadata.json";

export function createLocalDailyPhotoMetadataStore(): DailyPhotoMetadataStore {
  const directory = new Directory(Paths.document, dailyPhotosDirectoryName);
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

      if (!Array.isArray(parsed)) {
        return [];
      }

      const photos = parsed.map(toDailyPhoto).filter(isDailyPhoto);
      const activePhotos = photos.filter((photo) => !isLegacyDevelopmentDailyPhoto(photo));

      if (activePhotos.length !== parsed.length) {
        writeMetadata(directory, file, activePhotos);
      }

      return activePhotos;
    },
    async save(photos) {
      writeMetadata(directory, file, photos);
    },
  };
}

function writeMetadata(directory: Directory, file: File, photos: DailyPhoto[]) {
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

  file.write(JSON.stringify(photos, null, 2));
}

function isDailyPhoto(photo: DailyPhoto | null): photo is DailyPhoto {
  return photo !== null;
}

function toDailyPhoto(value: unknown): DailyPhoto | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const id = stringValue(value.id);
  const userId = stringValue(value.userId);
  const date = stringValue(value.date);
  const imagePath = stringValue(value.imagePath);
  const createdAt = stringValue(value.createdAt);
  const updatedAt = stringValue(value.updatedAt);

  if (!id || !userId || !date || !imagePath || !createdAt || !updatedAt) {
    return null;
  }

  return {
    id,
    userId,
    date,
    imagePath,
    localImagePath: stringValue(value.localImagePath) ?? imagePath,
    remoteImageUrl: stringValue(value.remoteImageUrl),
    storageKey: stringValue(value.storageKey),
    syncStatus: syncStatusValue(value.syncStatus),
    createdAt,
    updatedAt,
    lockedAt: stringValue(value.lockedAt),
  };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function syncStatusValue(value: unknown): DailyPhotoSyncStatus {
  if (value === "syncing" || value === "synced" || value === "failed") {
    return value;
  }

  return "local";
}
