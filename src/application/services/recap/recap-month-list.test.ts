import { describe, expect, it } from "vitest";

import {
  createRecapMonthSummaries,
  createRecapYearMonths,
  createRecapYearOptions,
  createVisibleRecapYearMonths,
} from "@/application/services/recap/recap-month-list";
import { createLocalDailyPhotoRepository } from "@/infrastructure/persistence/daily-photo/local-daily-photo-repository";
import { createLocalMonthlyRecapRepository } from "@/infrastructure/persistence/recap/local-monthly-recap-repository";
import { dayjs } from "@/shared/date/dayjs";

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
      currentDate: dayjs("2026-06-28").toDate(),
      previewPhotoLimit: 3,
      repository,
      userId: "user-1",
      year: 2026,
    });
    const june = months.find((month) => month.month === "2026-06");

    expect(june?.photoCount).toBe(5);
    expect(june?.previewPhotos).toHaveLength(3);
    expect(june?.previewPhotos.map((photo) => photo.date)).toEqual(["2026-06-01", "2026-06-02", "2026-06-03"]);
    expect(june?.status).toBe("selected");
  });

  it("hides future months and months before the recap start month by default", () => {
    expect(createVisibleRecapYearMonths({
      currentDate: dayjs("2026-06-28").toDate(),
      year: 2026,
    }).map((month) => month.month)).toEqual(["2026-06"]);

    expect(createVisibleRecapYearMonths({
      currentDate: dayjs("2026-08-01").toDate(),
      year: 2026,
    }).map((month) => month.month)).toEqual(["2026-06", "2026-07", "2026-08"]);
  });

  it("includes months before the recap start month only when requested", () => {
    expect(createVisibleRecapYearMonths({
      currentDate: dayjs("2026-06-28").toDate(),
      includeMonthsBeforeStart: true,
      year: 2026,
    }).map((month) => month.month)).toEqual([
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
    ]);
  });

  it("marks visible months with no recap photos as disabled", async () => {
    const repository = createLocalDailyPhotoRepository();

    const months = await createRecapMonthSummaries({
      currentDate: dayjs("2026-06-28").toDate(),
      includeMonthsBeforeStart: true,
      repository,
      userId: "user-1",
      year: 2026,
    });

    expect(months).toHaveLength(6);
    expect(months.map((month) => month.month)).toEqual([
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
    ]);
    expect(months.every((month) => month.status === "disabled")).toBe(true);
  });

  it("marks months with at least 10 photos and no selected photos as needing selection", async () => {
    const repository = createLocalDailyPhotoRepository();

    for (let index = 0; index < 10; index += 1) {
      await repository.saveToday({
        date: `2026-06-${String(index + 1).padStart(2, "0")}`,
        imagePath: `file://real-${index + 1}.jpg`,
        userId: "user-1",
      });
    }

    const months = await createRecapMonthSummaries({
      currentDate: dayjs("2026-06-28").toDate(),
      repository,
      userId: "user-1",
      year: 2026,
    });
    const june = months.find((month) => month.month === "2026-06");

    expect(june?.photoCount).toBe(10);
    expect(june?.status).toBe("needs_selection");
  });

  it("marks a month with selected representative photos as selected", async () => {
    const repository = createLocalDailyPhotoRepository();
    const recapRepository = createLocalMonthlyRecapRepository();
    const savedPhoto = await repository.saveToday({ date: "2026-06-14", imagePath: "file://real-14.jpg", userId: "user-1" });

    await recapRepository.saveSelection({
      month: "2026-06",
      selectedPhotoIds: [savedPhoto.id],
      userId: "user-1",
    });

    const months = await createRecapMonthSummaries({
      currentDate: dayjs("2026-06-28").toDate(),
      recapRepository,
      repository,
      userId: "user-1",
      year: 2026,
    });
    const june = months.find((month) => month.month === "2026-06");

    expect(june).toMatchObject({
      month: "2026-06",
      selectedPhotoIds: [savedPhoto.id],
      status: "selected",
    });
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
