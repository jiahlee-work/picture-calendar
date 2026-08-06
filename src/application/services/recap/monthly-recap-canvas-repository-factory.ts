import { createLocalMonthlyRecapCanvasMetadataStore } from "@/infrastructure/persistence/recap/local-monthly-recap-canvas-metadata-store";
import { createLocalMonthlyRecapCanvasRepository } from "@/infrastructure/persistence/recap/local-monthly-recap-canvas-repository";
import type { MonthlyRecapCanvasRepository } from "@/application/services/recap/types";

export function createMonthlyRecapCanvasRepositoryForRuntime(
  platform: string,
): MonthlyRecapCanvasRepository {
  if (platform === "web") {
    return createLocalMonthlyRecapCanvasRepository();
  }

  return createLocalMonthlyRecapCanvasRepository({
    metadataStore: createLocalMonthlyRecapCanvasMetadataStore(),
  });
}
