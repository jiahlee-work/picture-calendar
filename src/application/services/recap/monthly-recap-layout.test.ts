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
