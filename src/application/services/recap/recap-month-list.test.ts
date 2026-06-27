import { describe, expect, it } from "vitest";

import {
  createRecapMonthSummaries,
  createRecapYearMonths,
  createRecapYearOptions,
} from "@/application/services/recap/recap-month-list";
import { createLocalDailyPhotoRepository } from "@/infrastructure/persistence/daily-photo/local-daily-photo-repository";

describe("recap month list", () => {
  it("creates 12 month summaries for the selected year", () => {
    const months = createRecapYearMonths(2027);

    expect(months).toHaveLength(12);
    expect(months[0]).toMatchObject({
      month: "2027-01",
      monthLabel: "January",
      monthNumber: "01",
      year: 2027,
    });
    expect(months[11]).toMatchObject({
      month: "2027-12",
      monthLabel: "December",
      monthNumber: "12",
      year: 2027,
    });
  });

  it("builds month summaries with photo counts and limited previews", async () => {
    const repository = createLocalDailyPhotoRepository();

    await repository.saveToday({ date: "2026-06-05", imagePath: "file://5.jpg", userId: "user-1" });
    await repository.saveToday({ date: "2026-06-01", imagePath: "file://1.jpg", userId: "user-1" });
    await repository.saveToday({ date: "2026-06-03", imagePath: "file://3.jpg", userId: "user-1" });
    await repository.saveToday({ date: "2026-06-04", imagePath: "file://4.jpg", userId: "user-1" });
    await repository.saveToday({ date: "2026-06-02", imagePath: "file://2.jpg", userId: "user-1" });

    const months = await createRecapMonthSummaries({
      previewPhotoLimit: 3,
      repository,
      userId: "user-1",
      year: 2026,
    });
    const june = months.find((month) => month.month === "2026-06");

    expect(june?.photoCount).toBe(5);
    expect(june?.previewPhotos).toHaveLength(3);
    expect(june?.previewPhotos.map((photo) => photo.date)).toEqual(["2026-06-01", "2026-06-02", "2026-06-03"]);
  });

  it("offers the current year as the default year option", () => {
    expect(createRecapYearOptions(2026)).toEqual([
      {
        label: "2026",
        year: 2026,
      },
    ]);
  });
});
