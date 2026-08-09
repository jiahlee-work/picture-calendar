import { createLocalDailyPhotoMetadataStore } from "@/infrastructure/persistence/daily-photo/local-daily-photo-metadata-store";
import { createLocalDailyPhotoRepository } from "@/infrastructure/persistence/daily-photo/local-daily-photo-repository";
import type { DailyPhotoRepository } from "@/application/services/daily-photo/types";

export function createDailyPhotoRepositoryForRuntime(
  platform: string,
): DailyPhotoRepository {
  if (platform === "web") {
    return createLocalDailyPhotoRepository();
  }

  return createLocalDailyPhotoRepository({
    metadataStore: createLocalDailyPhotoMetadataStore(),
  });
}
