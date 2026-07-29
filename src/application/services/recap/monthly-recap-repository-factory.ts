import { createLocalMonthlyRecapMetadataStore } from "@/infrastructure/persistence/recap/local-monthly-recap-metadata-store";
import { createLocalMonthlyRecapRepository } from "@/infrastructure/persistence/recap/local-monthly-recap-repository";
import type { MonthlyRecapRepository } from "@/application/services/recap/types";

export function createMonthlyRecapRepositoryForRuntime(
  platform: string,
): MonthlyRecapRepository {
  if (platform === "web") {
    return createLocalMonthlyRecapRepository();
  }

  return createLocalMonthlyRecapRepository({
    metadataStore: createLocalMonthlyRecapMetadataStore(),
  });
}
