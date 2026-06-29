import { describe, expect, it } from "vitest";

import {
  canCreateRecapForMonth,
  createRecapMonthSummaries,
  createRecapYearMonths,
  createRecapYearOptions,
  createVisibleRecapYearMonths,
} from "@/application/services/recap/recap-month-list";
import { createLocalDailyPhotoRepository } from "@/infrastructure/persistence/daily-photo/local-daily-photo-repository";
import { createLocalMonthlyRecapRepository } from "@/infrastructure/persistence/recap/local-monthly-recap-repository";
import { toMonthKey } from "@/shared/date/date-key";
import { dayjs } from "@/shared/date/dayjs";

const recapTimeline = createRecapTimeline();
const localUserId = "user-1";

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

    await saveMonthPhotos(repository, recapTimeline.currentMonth, 5, [5, 1, 3, 4, 2]);

    const months = await createRecapMonthSummaries({
      currentDate: recapTimeline.currentDate,
      previewPhotoLimit: 3,
      repository,
      userId: localUserId,
      year: recapTimeline.year,
    });
    const currentMonth = months.find((month) => month.month === recapTimeline.currentMonth);

    expect(currentMonth?.photoCount).toBe(5);
    expect(currentMonth?.previewPhotos).toHaveLength(3);
    expect(currentMonth?.previewPhotos.map((photo) => photo.date)).toEqual([
      toDayKey(recapTimeline.currentMonth, 1),
      toDayKey(recapTimeline.currentMonth, 2),
      toDayKey(recapTimeline.currentMonth, 3),
    ]);
    expect(currentMonth?.status).toBe("disabled_collecting");
  });

  it("hides future months and months before the recap start month by default", () => {
    expect(createVisibleRecapYearMonths({
      currentDate: recapTimeline.currentDate,
      year: recapTimeline.year,
    }).map((month) => month.month)).toEqual([recapTimeline.previousMonth, recapTimeline.currentMonth]);

    expect(createVisibleRecapYearMonths({
      currentDate: recapTimeline.nextMonthDate,
      year: recapTimeline.year,
    }).map((month) => month.month)).toEqual([
      recapTimeline.previousMonth,
      recapTimeline.currentMonth,
      recapTimeline.futureMonth,
    ]);
  });

  it("includes months before the recap start month only when requested", () => {
    const visibleMonths = createVisibleRecapYearMonths({
      currentDate: recapTimeline.currentDate,
      includeMonthsBeforeStart: true,
      year: recapTimeline.year,
    }).map((month) => month.month);

    expect(createVisibleRecapYearMonths({
      currentDate: recapTimeline.currentDate,
      includeMonthsBeforeStart: true,
      year: recapTimeline.year,
    }).map((month) => month.month)).toEqual(visibleMonths);
    expect(visibleMonths.at(0)).toBe(toMonthKey(dayjs(recapTimeline.currentDate).startOf("year").toDate()));
    expect(visibleMonths.at(-1)).toBe(recapTimeline.currentMonth);
  });

  it("marks visible months with no recap photos as disabled empty", async () => {
    const repository = createLocalDailyPhotoRepository();

    const months = await createRecapMonthSummaries({
      currentDate: recapTimeline.currentDate,
      includeMonthsBeforeStart: true,
      repository,
      userId: localUserId,
      year: recapTimeline.year,
    });

    expect(months).toHaveLength(dayjs(recapTimeline.currentDate).month() + 1);
    expect(months.every((month) => month.status === "disabled_empty")).toBe(true);
  });

  it.each([
    {
      availabilityMode: "production" as const,
      monthKind: "current" as const,
      photoCount: 0,
      expectedStatus: "disabled_empty",
    },
    {
      availabilityMode: "production" as const,
      monthKind: "current" as const,
      photoCount: 1,
      expectedStatus: "disabled_collecting",
    },
    {
      availabilityMode: "production" as const,
      monthKind: "previous" as const,
      photoCount: 0,
      expectedStatus: "disabled_empty",
    },
    {
      availabilityMode: "production" as const,
      monthKind: "previous" as const,
      photoCount: 1,
      expectedStatus: "ready_auto",
    },
    {
      availabilityMode: "production" as const,
      monthKind: "previous" as const,
      photoCount: 9,
      expectedStatus: "ready_auto",
    },
    {
      availabilityMode: "production" as const,
      monthKind: "previous" as const,
      photoCount: 10,
      expectedStatus: "needs_selection",
    },
    {
      availabilityMode: "development" as const,
      monthKind: "current" as const,
      photoCount: 1,
      expectedStatus: "ready_auto",
    },
    {
      availabilityMode: "development" as const,
      monthKind: "current" as const,
      photoCount: 10,
      expectedStatus: "needs_selection",
    },
  ])(
    "marks $availabilityMode $monthKind month with $photoCount photos as $expectedStatus",
    async ({ availabilityMode, expectedStatus, monthKind, photoCount }) => {
      const repository = createLocalDailyPhotoRepository();
      const targetMonth = toTimelineMonth(monthKind);

      await saveMonthPhotos(repository, targetMonth, photoCount);

      const months = await createRecapMonthSummaries({
        availabilityMode,
        currentDate: recapTimeline.currentDate,
        repository,
        userId: localUserId,
        year: recapTimeline.year,
      });
      const targetMonthSummary = months.find((month) => month.month === targetMonth);

      expect(targetMonthSummary).toMatchObject({
        month: targetMonth,
        photoCount,
        status: expectedStatus,
      });
      expect(targetMonthSummary?.previewPhotos).toHaveLength(Math.min(photoCount, 4));
    },
  );

  it("does not allow future months to create recaps even in development", () => {
    expect(canCreateRecapForMonth({
      availabilityMode: "development",
      currentDate: recapTimeline.currentDate,
      month: recapTimeline.futureMonth,
    })).toBe(false);
  });

  it("marks a month with selected representative photos as selected", async () => {
    const repository = createLocalDailyPhotoRepository();
    const recapRepository = createLocalMonthlyRecapRepository();
    const savedPhoto = await saveMonthPhoto(repository, recapTimeline.previousMonth, 14);

    await recapRepository.saveSelection({
      month: recapTimeline.previousMonth,
      selectedPhotoIds: [savedPhoto.id],
      userId: localUserId,
    });

    const months = await createRecapMonthSummaries({
      currentDate: recapTimeline.currentDate,
      recapRepository,
      repository,
      userId: localUserId,
      year: recapTimeline.year,
    });
    const previousMonth = months.find((month) => month.month === recapTimeline.previousMonth);

    expect(previousMonth).toMatchObject({
      month: recapTimeline.previousMonth,
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

type TimelineMonthKind = "current" | "future" | "previous";

function createRecapTimeline() {
  const currentDate = dayjs("2026-07-28").toDate();
  const currentMonthDate = dayjs(currentDate).startOf("month");

  return {
    currentDate,
    currentMonth: toMonthKey(currentMonthDate.toDate()),
    futureMonth: toMonthKey(currentMonthDate.add(1, "month").toDate()),
    nextMonthDate: currentMonthDate.add(1, "month").toDate(),
    previousMonth: toMonthKey(currentMonthDate.subtract(1, "month").toDate()),
    year: currentMonthDate.year(),
  };
}

function toTimelineMonth(monthKind: TimelineMonthKind): string {
  if (monthKind === "previous") {
    return recapTimeline.previousMonth;
  }

  if (monthKind === "future") {
    return recapTimeline.futureMonth;
  }

  return recapTimeline.currentMonth;
}

async function saveMonthPhotos(
  repository: ReturnType<typeof createLocalDailyPhotoRepository>,
  month: string,
  count: number,
  days = Array.from({ length: count }, (_, index) => index + 1),
) {
  for (const day of days) {
    await saveMonthPhoto(repository, month, day);
  }
}

async function saveMonthPhoto(
  repository: ReturnType<typeof createLocalDailyPhotoRepository>,
  month: string,
  day: number,
) {
  return repository.saveToday({
    date: toDayKey(month, day),
    imagePath: `file://${month}-${day}.jpg`,
    userId: localUserId,
  });
}

function toDayKey(month: string, day: number): string {
  return `${month}-${String(day).padStart(2, "0")}`;
}
