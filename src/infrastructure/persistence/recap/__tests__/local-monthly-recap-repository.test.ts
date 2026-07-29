import { describe, expect, it } from "vitest";

import { createLocalMonthlyRecapRepository } from "@/infrastructure/persistence/recap/local-monthly-recap-repository";
import type {
  MonthlyRecap,
  MonthlyRecapMetadataStore,
} from "@/shared/recap/types";

describe("createLocalMonthlyRecapRepository", () => {
  it("stores unique selected photo ids without applying product limits", async () => {
    const repository = createLocalMonthlyRecapRepository();

    const recap = await repository.saveSelection({
      userId: "user-1",
      month: "2026-06",
      selectedPhotoIds: [
        "photo-1",
        "photo-1",
        "photo-2",
        "photo-3",
        "photo-4",
        "photo-5",
        "photo-6",
        "photo-7",
        "photo-8",
        "photo-9",
        "photo-10",
        "photo-11",
      ],
      templateId: "calendar_collage",
      calendarPhotoIds: ["photo-1", "photo-11", "missing-photo"],
      backgroundPhotoIds: ["photo-2", "photo-3"],
    });

    expect(recap.selectionStatus).toBe("selected");
    expect(recap.selectedPhotoIds).toEqual([
      "photo-1",
      "photo-2",
      "photo-3",
      "photo-4",
      "photo-5",
      "photo-6",
      "photo-7",
      "photo-8",
      "photo-9",
      "photo-10",
      "photo-11",
    ]);
    expect(recap.templateId).toBe("calendar_collage");
    expect(recap.calendarPhotoIds).toEqual(["photo-1", "photo-11"]);
    expect(recap.backgroundPhotoIds).toEqual(["photo-2", "photo-3"]);
    expect(recap.completedAt).not.toBeNull();
  });

  it("lists recaps by user and year in month order", async () => {
    const repository = createLocalMonthlyRecapRepository();

    await repository.saveSelection({
      userId: "user-1",
      month: "2026-03",
      selectedPhotoIds: ["photo-3"],
    });
    await repository.saveSelection({
      userId: "user-1",
      month: "2026-01",
      selectedPhotoIds: ["photo-1"],
    });
    await repository.saveSelection({
      userId: "user-2",
      month: "2026-02",
      selectedPhotoIds: ["other-photo"],
    });
    await repository.saveSelection({
      userId: "user-1",
      month: "2025-12",
      selectedPhotoIds: ["past-photo"],
    });

    await expect(
      repository.listByYear("user-1", "2026"),
    ).resolves.toMatchObject([
      { month: "2026-01", userId: "user-1" },
      { month: "2026-03", userId: "user-1" },
    ]);
  });

  it("keeps selected status when a selected recap is prompted again", async () => {
    const repository = createLocalMonthlyRecapRepository();

    await repository.saveSelection({
      userId: "user-1",
      month: "2026-06",
      selectedPhotoIds: ["photo-1"],
    });

    const promptedRecap = await repository.markPrompted("user-1", "2026-06");

    expect(promptedRecap.selectionStatus).toBe("selected");
    expect(promptedRecap.selectedPhotoIds).toEqual(["photo-1"]);
    expect(promptedRecap.promptedAt).not.toBeNull();
  });

  it("skips selection and clears selected photos", async () => {
    const metadataStore = createFakeMetadataStore();
    const repository = createLocalMonthlyRecapRepository({ metadataStore });

    await repository.saveSelection({
      userId: "user-1",
      month: "2026-06",
      selectedPhotoIds: ["photo-1"],
    });

    const skippedRecap = await repository.skipSelection("user-1", "2026-06");
    const restoredRepository = createLocalMonthlyRecapRepository({
      metadataStore,
    });

    expect(skippedRecap.selectionStatus).toBe("skipped");
    expect(skippedRecap.selectedPhotoIds).toEqual([]);
    expect(skippedRecap.calendarPhotoIds).toEqual([]);
    expect(skippedRecap.backgroundPhotoIds).toEqual([]);
    await expect(
      restoredRepository.getByMonth("user-1", "2026-06"),
    ).resolves.toMatchObject({
      month: "2026-06",
      selectedPhotoIds: [],
      selectionStatus: "skipped",
    });
  });
});

function createFakeMetadataStore(
  initialRecaps: MonthlyRecap[] = [],
): MonthlyRecapMetadataStore {
  let recaps = [...initialRecaps];

  return {
    async load() {
      return recaps;
    },
    async save(nextRecaps) {
      recaps = [...nextRecaps];
    },
  };
}
