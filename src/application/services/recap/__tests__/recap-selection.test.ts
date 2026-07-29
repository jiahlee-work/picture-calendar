import { describe, expect, it } from "vitest";

import {
  applyMonthlyRecapSelectionLimit,
  toggleMonthlyRecapSelectedPhotoId,
} from "@/application/services/recap/recap-selection";

describe("monthly recap photo selection", () => {
  it("adds and removes a selected photo id", () => {
    expect(toggleMonthlyRecapSelectedPhotoId(["photo-1"], "photo-2")).toEqual([
      "photo-1",
      "photo-2",
    ]);
    expect(
      toggleMonthlyRecapSelectedPhotoId(["photo-1", "photo-2"], "photo-1"),
    ).toEqual(["photo-2"]);
  });

  it("does not add more than the selection limit", () => {
    const selectedPhotoIds = Array.from(
      { length: 10 },
      (_, index) => `photo-${index + 1}`,
    );

    expect(
      toggleMonthlyRecapSelectedPhotoId(selectedPhotoIds, "photo-11"),
    ).toBe(selectedPhotoIds);
  });

  it("keeps unique selected photo ids within the selection limit", () => {
    const selectedPhotoIds = [
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
    ];

    expect(applyMonthlyRecapSelectionLimit(selectedPhotoIds)).toEqual([
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
    ]);
  });
});
