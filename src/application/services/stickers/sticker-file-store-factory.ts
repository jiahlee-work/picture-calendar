import { createLocalStickerFileStore } from "@/infrastructure/persistence/stickers/local-sticker-file-store";
import type { StickerFileStore } from "@/application/services/stickers/types";
import {
  imageFileExtensionFromFileName,
  imageFileExtensionFromMimeType,
} from "@/shared/daily-photo/storage-key";
import { dayjs } from "@/shared/date/dayjs";
import { toStickerStorageKey } from "@/shared/stickers/storage-key";

export function createStickerFileStoreForRuntime(
  platform = process.env.EXPO_OS,
): StickerFileStore {
  if (platform === "web") {
    return createWebStickerFileStore();
  }

  return createLocalStickerFileStore();
}

function createWebStickerFileStore(): StickerFileStore {
  return {
    async save({ fileName, mimeType, sourceUri, userId }) {
      const storageKey = toStickerStorageKey({
        userId,
        extension:
          imageFileExtensionFromMimeType(mimeType) ??
          imageFileExtensionFromFileName(fileName),
        revision: dayjs().valueOf().toString(36),
      });

      return {
        imagePath: sourceUri,
        storageKey,
      };
    },
    async delete() {
      return;
    },
  };
}
