import { createLocalStickerMetadataStore } from "@/infrastructure/persistence/stickers/local-sticker-metadata-store";
import { createLocalStickerRepository } from "@/infrastructure/persistence/stickers/local-sticker-repository";
import { createStickerFileStoreForRuntime } from "@/application/services/stickers/sticker-file-store-factory";
import type { StickerRepository } from "@/application/services/stickers/types";

export function createStickerRepositoryForRuntime(
  platform = process.env.EXPO_OS,
): StickerRepository {
  if (platform === "web") {
    return createLocalStickerRepository();
  }

  return createLocalStickerRepository({
    fileStore: createStickerFileStoreForRuntime(platform),
    metadataStore: createLocalStickerMetadataStore(),
  });
}
