import { createLocalDailyPhotoFileStore } from "@/infrastructure/persistence/daily-photo/local-daily-photo-file-store";
import { dayjs } from "@/shared/date/dayjs";
import type { DailyPhotoFileStore } from "@/shared/daily-photo/types";

export function createDailyPhotoFileStoreForRuntime(platform = process.env.EXPO_OS): DailyPhotoFileStore {
  if (platform === "web") {
    return createWebDailyPhotoFileStore();
  }

  return createLocalDailyPhotoFileStore();
}

function createWebDailyPhotoFileStore(): DailyPhotoFileStore {
  return {
    async save({ date, sourceUri, userId }) {
      return {
        imagePath: sourceUri,
        localImagePath: sourceUri,
        remoteImageUrl: null,
        storageKey: `web/${userId}/${date}/${dayjs().valueOf().toString(36)}`,
        syncStatus: "local",
      };
    },
    async delete() {
      return;
    },
  };
}
