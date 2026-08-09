import { createLocalStickerPlacementMetadataStore } from "@/infrastructure/persistence/stickers/local-sticker-placement-metadata-store";
import { createLocalStickerPlacementRepository } from "@/infrastructure/persistence/stickers/local-sticker-placement-repository";
import type { StickerPlacementRepository } from "@/application/services/stickers/types";

export function createStickerPlacementRepositoryForRuntime(
  platform: string,
): StickerPlacementRepository {
  if (platform === "web") {
    return createLocalStickerPlacementRepository();
  }

  return createLocalStickerPlacementRepository({
    metadataStore: createLocalStickerPlacementMetadataStore(),
  });
}
