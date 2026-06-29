import { describe, expect, it } from "vitest";

import {
  createAutoMonthlyRecapDraft,
  createManualMonthlyRecapDraft,
  shouldRefreshAutoMonthlyRecap,
} from "@/application/services/recap/monthly-recap-layout";

describe("monthly recap layout", () => {
  it("creates a message recap draft for one to three monthly photos", () => {
    expect(createAutoMonthlyRecapDraft({
      userId: "user-1",
      month: "2026-06",
      photoIds: ["photo-1", "photo-2", "photo-3"],
    })).toEqual({
      userId: "user-1",
      month: "2026-06",
      selectedPhotoIds: ["photo-1", "photo-2", "photo-3"],
      templateId: "message",
      calendarPhotoIds: [],
      backgroundPhotoIds: [],
    });
  });

  it("creates a calendar collage draft for four to nine monthly photos", () => {
    const draft = createAutoMonthlyRecapDraft({
      userId: "user-1",
      month: "2026-06",
      photoIds: ["photo-1", "photo-2", "photo-3", "photo-4"],
      random: () => 0,
    });

    expect(draft).toEqual({
      userId: "user-1",
      month: "2026-06",
      selectedPhotoIds: ["photo-1", "photo-2", "photo-3", "photo-4"],
      templateId: "calendar_collage",
      calendarPhotoIds: ["photo-1", "photo-3", "photo-4"],
      backgroundPhotoIds: ["photo-2"],
    });
  });

  it.each([4, 5, 6, 7, 8, 9])(
    "keeps every photo in either the background or calendar layout for a %i-photo automatic recap",
    (photoCount) => {
      const photoIds = createPhotoIds(photoCount);
      const draft = createAutoMonthlyRecapDraft({
        userId: "user-1",
        month: "2026-06",
        photoIds,
        random: () => 0,
      });

      expect(draft).toMatchObject({
        selectedPhotoIds: photoIds,
        templateId: "calendar_collage",
      });
      expect(draft?.backgroundPhotoIds).toHaveLength(1);
      expect(draft?.calendarPhotoIds).toHaveLength(photoCount - 1);
      expect(new Set([...(draft?.backgroundPhotoIds ?? []), ...(draft?.calendarPhotoIds ?? [])])).toEqual(
        new Set(photoIds),
      );
    },
  );

  it("creates a manual calendar collage with four calendar photos and the rest as background photos", () => {
    const selectedPhotoIds = createPhotoIds(10);
    const draft = createAutoMonthlyRecapDraft({
      userId: "user-1",
      month: "2026-06",
      photoIds: selectedPhotoIds,
      random: () => 0,
    });

    expect(draft).toBeNull();

    const manualDraft = createManualMonthlyRecapDraft({
      userId: "user-1",
      month: "2026-06",
      selectedPhotoIds,
      random: () => 0,
    });

    expect(manualDraft).toMatchObject({
      selectedPhotoIds,
      templateId: "calendar_collage",
    });
    const calendarPhotoIds = manualDraft.calendarPhotoIds ?? [];
    const backgroundPhotoIds = manualDraft.backgroundPhotoIds ?? [];

    expect(calendarPhotoIds).toHaveLength(4);
    expect(backgroundPhotoIds).toHaveLength(6);
    expect(new Set([...backgroundPhotoIds, ...calendarPhotoIds])).toEqual(
      new Set(selectedPhotoIds),
    );
  });

  it("does not auto-create a draft when representative photo selection is needed", () => {
    expect(createAutoMonthlyRecapDraft({
      userId: "user-1",
      month: "2026-06",
      photoIds: [
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
      ],
    })).toBeNull();
  });

  it("refreshes an automatic recap when monthly photos change", () => {
    expect(shouldRefreshAutoMonthlyRecap({
      photoIds: ["photo-1", "photo-2", "photo-3"],
      selectedPhotoIds: ["photo-1", "photo-2"],
    })).toBe(true);
    expect(shouldRefreshAutoMonthlyRecap({
      photoIds: ["photo-1", "photo-2", "photo-3"],
      selectedPhotoIds: ["photo-1", "photo-2", "photo-3"],
    })).toBe(false);
    expect(shouldRefreshAutoMonthlyRecap({
      photoIds: ["photo-1", "photo-2", "photo-3"],
      selectedPhotoIds: ["photo-2", "photo-3", "photo-1"],
    })).toBe(true);
  });

  it("does not refresh automatically when representative photo selection is needed", () => {
    expect(shouldRefreshAutoMonthlyRecap({
      photoIds: [
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
      ],
      selectedPhotoIds: ["photo-1"],
    })).toBe(false);
  });

  it("creates a manual calendar collage draft from selected representative photos", () => {
    const draft = createManualMonthlyRecapDraft({
      userId: "user-1",
      month: "2026-06",
      selectedPhotoIds: ["photo-1", "photo-2", "photo-3", "photo-4", "photo-5", "photo-6"],
      random: () => 0,
    });

    expect(draft).toEqual({
      userId: "user-1",
      month: "2026-06",
      selectedPhotoIds: ["photo-1", "photo-2", "photo-3", "photo-4", "photo-5", "photo-6"],
      templateId: "calendar_collage",
      calendarPhotoIds: ["photo-2", "photo-3", "photo-4", "photo-5"],
      backgroundPhotoIds: ["photo-1", "photo-6"],
    });
  });
});

function createPhotoIds(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `photo-${index + 1}`);
}
