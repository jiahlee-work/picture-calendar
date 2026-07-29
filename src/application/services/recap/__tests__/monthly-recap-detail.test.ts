import { describe, expect, it } from "vitest";

import type {
  DailyPhoto,
  DailyPhotoRepository,
} from "@/application/services/daily-photo/types";
import { loadMonthlyRecapDetail } from "@/application/services/recap/monthly-recap-detail";
import { createLocalMonthlyRecapRepository } from "@/infrastructure/persistence/recap/local-monthly-recap-repository";
import { toMonthKey } from "@/shared/date/date-key";
import { dayjs } from "@/shared/date/dayjs";

const recapTimeline = createRecapTimeline();
const LOCAL_USER_ID = "user-1";

describe("loadMonthlyRecapDetail", () => {
  it("keeps the first generated automatic layout when the same month is opened again", async () => {
    const dailyPhotoRepository = createFakeDailyPhotoRepository(
      createPhotos(recapTimeline.previousMonth, 6),
    );
    const recapRepository = createLocalMonthlyRecapRepository();
    const firstResult = await loadMonthlyRecapDetail({
      currentDate: recapTimeline.currentDate,
      dailyPhotoRepository,
      month: recapTimeline.previousMonth,
      random: () => 0,
      recapRepository,
      userId: LOCAL_USER_ID,
    });

    const secondResult = await loadMonthlyRecapDetail({
      currentDate: recapTimeline.currentDate,
      dailyPhotoRepository,
      month: recapTimeline.previousMonth,
      random: () => 0.999,
      recapRepository,
      userId: LOCAL_USER_ID,
    });

    expect(firstResult.status).toBe("ready");
    expect(secondResult.status).toBe("ready");
    expect(secondResult.recap?.backgroundPhotoIds).toEqual(
      firstResult.recap?.backgroundPhotoIds,
    );
    expect(secondResult.recap?.calendarPhotoIds).toEqual(
      firstResult.recap?.calendarPhotoIds,
    );
    expect(secondResult.recap?.updatedAt).toEqual(firstResult.recap?.updatedAt);
  });

  it("does not create a recap for the current month in production", async () => {
    const dailyPhotoRepository = createFakeDailyPhotoRepository(
      createPhotos(recapTimeline.currentMonth, 6),
    );
    const recapRepository = createLocalMonthlyRecapRepository();

    const result = await loadMonthlyRecapDetail({
      currentDate: recapTimeline.currentDate,
      dailyPhotoRepository,
      month: recapTimeline.currentMonth,
      random: () => 0,
      recapRepository,
      userId: LOCAL_USER_ID,
    });

    expect(result.status).toBe("collecting");
    await expect(
      recapRepository.getByMonth(LOCAL_USER_ID, recapTimeline.currentMonth),
    ).resolves.toBeNull();
  });

  it("creates a recap for the current month in development", async () => {
    const dailyPhotoRepository = createFakeDailyPhotoRepository(
      createPhotos(recapTimeline.currentMonth, 6),
    );
    const recapRepository = createLocalMonthlyRecapRepository();

    const result = await loadMonthlyRecapDetail({
      availabilityMode: "development",
      currentDate: recapTimeline.currentDate,
      dailyPhotoRepository,
      month: recapTimeline.currentMonth,
      random: () => 0,
      recapRepository,
      userId: LOCAL_USER_ID,
    });

    expect(result.status).toBe("ready");
    await expect(
      recapRepository.getByMonth(LOCAL_USER_ID, recapTimeline.currentMonth),
    ).resolves.toMatchObject({
      month: recapTimeline.currentMonth,
      selectionStatus: "selected",
    });
  });

  it("does not create a recap for a future month even in development", async () => {
    const dailyPhotoRepository = createFakeDailyPhotoRepository(
      createPhotos(recapTimeline.futureMonth, 6),
    );
    const recapRepository = createLocalMonthlyRecapRepository();

    const result = await loadMonthlyRecapDetail({
      availabilityMode: "development",
      currentDate: recapTimeline.currentDate,
      dailyPhotoRepository,
      month: recapTimeline.futureMonth,
      random: () => 0,
      recapRepository,
      userId: LOCAL_USER_ID,
    });

    expect(result.status).toBe("collecting");
    await expect(
      recapRepository.getByMonth(LOCAL_USER_ID, recapTimeline.futureMonth),
    ).resolves.toBeNull();
  });

  it("refreshes an automatic layout only when the monthly photos change", async () => {
    const dailyPhotoRepository = createMutableDailyPhotoRepository(
      createPhotos(recapTimeline.previousMonth, 4),
    );
    const recapRepository = createLocalMonthlyRecapRepository();
    const firstResult = await loadMonthlyRecapDetail({
      currentDate: recapTimeline.currentDate,
      dailyPhotoRepository,
      month: recapTimeline.previousMonth,
      random: () => 0,
      recapRepository,
      userId: LOCAL_USER_ID,
    });

    dailyPhotoRepository.setPhotos(
      createPhotos(recapTimeline.previousMonth, 5),
    );

    const secondResult = await loadMonthlyRecapDetail({
      currentDate: recapTimeline.currentDate,
      dailyPhotoRepository,
      month: recapTimeline.previousMonth,
      random: () => 0.999,
      recapRepository,
      userId: LOCAL_USER_ID,
    });

    expect(firstResult.status).toBe("ready");
    expect(secondResult.status).toBe("ready");
    expect(secondResult.recap?.selectedPhotoIds).toEqual([
      "photo-1",
      "photo-2",
      "photo-3",
      "photo-4",
      "photo-5",
    ]);
    expect(secondResult.recap?.backgroundPhotoIds).not.toEqual(
      firstResult.recap?.backgroundPhotoIds,
    );
  });

  it("refreshes a manual layout when a selected representative photo is deleted", async () => {
    const dailyPhotoRepository = createMutableDailyPhotoRepository(
      createPhotos(recapTimeline.previousMonth, 11),
    );
    const recapRepository = createLocalMonthlyRecapRepository();
    const firstResult = await loadMonthlyRecapDetail({
      currentDate: recapTimeline.currentDate,
      dailyPhotoRepository,
      month: recapTimeline.previousMonth,
      random: () => 0,
      recapRepository,
      userId: LOCAL_USER_ID,
    });

    expect(firstResult.status).toBe("needs_selection");

    await recapRepository.saveSelection({
      userId: LOCAL_USER_ID,
      month: recapTimeline.previousMonth,
      selectedPhotoIds: createPhotoIds(10),
      calendarPhotoIds: ["photo-1", "photo-2", "photo-3", "photo-4"],
      backgroundPhotoIds: [
        "photo-5",
        "photo-6",
        "photo-7",
        "photo-8",
        "photo-9",
        "photo-10",
      ],
    });
    dailyPhotoRepository.setPhotos(
      createPhotos(recapTimeline.previousMonth, 11).filter(
        (photo) => photo.id !== "photo-10",
      ),
    );

    const secondResult = await loadMonthlyRecapDetail({
      currentDate: recapTimeline.currentDate,
      dailyPhotoRepository,
      month: recapTimeline.previousMonth,
      random: () => 0.999,
      recapRepository,
      userId: LOCAL_USER_ID,
    });

    expect(secondResult.status).toBe("ready");
    expect(secondResult.recap?.selectedPhotoIds).toEqual(createPhotoIds(9));
    expect(secondResult.recap?.backgroundPhotoIds).not.toContain("photo-10");
    expect(secondResult.recap?.calendarPhotoIds).not.toContain("photo-10");
  });
});

function createFakeDailyPhotoRepository(
  photos: DailyPhoto[],
): DailyPhotoRepository {
  return createMutableDailyPhotoRepository(photos);
}

function createMutableDailyPhotoRepository(initialPhotos: DailyPhoto[]) {
  let photos = [...initialPhotos];

  return {
    async deleteByDate() {
      return null;
    },
    async hasAny() {
      return photos.length > 0;
    },
    async listByMonth() {
      return photos;
    },
    async saveToday(photo) {
      const savedPhoto: DailyPhoto = {
        id: `photo-${photos.length + 1}`,
        userId: photo.userId,
        date: photo.date,
        imagePath: photo.imagePath,
        localImagePath: photo.localImagePath ?? photo.imagePath,
        remoteImageUrl: photo.remoteImageUrl ?? null,
        storageKey: photo.storageKey ?? null,
        syncStatus: photo.syncStatus ?? "local",
        createdAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z",
        lockedAt: null,
      };

      photos = [...photos, savedPhoto];

      return savedPhoto;
    },
    setPhotos(nextPhotos: DailyPhoto[]) {
      photos = [...nextPhotos];
    },
  } satisfies DailyPhotoRepository & {
    setPhotos: (nextPhotos: DailyPhoto[]) => void;
  };
}

function createPhotos(month: string, count: number): DailyPhoto[] {
  return Array.from({ length: count }, (_, index) => {
    const photoNumber = index + 1;

    return {
      id: `photo-${photoNumber}`,
      userId: LOCAL_USER_ID,
      date: `${month}-${String(photoNumber).padStart(2, "0")}`,
      imagePath: `file://photo-${photoNumber}.jpg`,
      localImagePath: `file://photo-${photoNumber}.jpg`,
      remoteImageUrl: null,
      storageKey: null,
      syncStatus: "local",
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
      lockedAt: null,
    };
  });
}

function createPhotoIds(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `photo-${index + 1}`);
}

function createRecapTimeline() {
  const currentDate = dayjs("2026-07-28").toDate();
  const currentMonthDate = dayjs(currentDate).startOf("month");

  return {
    currentDate,
    currentMonth: toMonthKey(currentMonthDate.toDate()),
    futureMonth: toMonthKey(currentMonthDate.add(1, "month").toDate()),
    previousMonth: toMonthKey(currentMonthDate.subtract(1, "month").toDate()),
  };
}
