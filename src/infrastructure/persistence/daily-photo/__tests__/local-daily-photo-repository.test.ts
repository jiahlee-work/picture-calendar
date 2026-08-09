import { describe, expect, it } from "vitest";

import { createLocalDailyPhotoRepository } from "@/infrastructure/persistence/daily-photo/local-daily-photo-repository";
import type {
  DailyPhoto,
  DailyPhotoMetadataStore,
} from "@/shared/daily-photo/types";

describe("createLocalDailyPhotoRepository", () => {
  it("detects whether a user has any daily photo", async () => {
    const repository = createLocalDailyPhotoRepository();

    expect(await repository.hasAny("user-1")).toBe(false);

    await repository.saveToday({
      userId: "user-1",
      date: "2026-04-09",
      imagePath: "file://photo.jpg",
    });

    expect(await repository.hasAny("user-1")).toBe(true);
    expect(await repository.hasAny("user-2")).toBe(false);
  });

  it("keeps the original createdAt when today's photo is changed", async () => {
    const repository = createLocalDailyPhotoRepository();
    const firstPhoto = await repository.saveToday({
      userId: "user-1",
      date: "2026-04-09",
      imagePath: "file://first.jpg",
    });

    const changedPhoto = await repository.saveToday({
      userId: "user-1",
      date: "2026-04-09",
      imagePath: "file://changed.jpg",
    });

    expect(changedPhoto.id).toBe(firstPhoto.id);
    expect(changedPhoto.createdAt).toBe(firstPhoto.createdAt);
    expect(changedPhoto.imagePath).toBe("file://changed.jpg");
  });

  it("stores local-first metadata for future remote sync", async () => {
    const repository = createLocalDailyPhotoRepository();

    const savedPhoto = await repository.saveToday({
      userId: "user-1",
      date: "2026-04-09",
      imagePath: "file://daily-photos/user-1/2026-04-09.jpg",
      localImagePath: "file://daily-photos/user-1/2026-04-09.jpg",
      remoteImageUrl: null,
      storageKey: "user-1/2026-04-09.jpg",
      syncStatus: "local",
    });

    expect(savedPhoto).toMatchObject({
      imagePath: "file://daily-photos/user-1/2026-04-09.jpg",
      localImagePath: "file://daily-photos/user-1/2026-04-09.jpg",
      remoteImageUrl: null,
      storageKey: "user-1/2026-04-09.jpg",
      syncStatus: "local",
    });
  });

  it("persists metadata through the configured store", async () => {
    const metadataStore = createFakeMetadataStore();
    const repository = createLocalDailyPhotoRepository({ metadataStore });

    await repository.saveToday({
      userId: "user-1",
      date: "2026-04-09",
      imagePath: "file://daily-photos/user-1/2026-04-09.jpg",
      storageKey: "user-1/2026-04-09.jpg",
    });

    const restoredRepository = createLocalDailyPhotoRepository({
      metadataStore,
    });

    await expect(
      restoredRepository.listByMonth("user-1", "2026-04"),
    ).resolves.toMatchObject([
      {
        userId: "user-1",
        date: "2026-04-09",
        imagePath: "file://daily-photos/user-1/2026-04-09.jpg",
        storageKey: "user-1/2026-04-09.jpg",
      },
    ]);
  });

  it("stores daily photos by user and date", async () => {
    const repository = createLocalDailyPhotoRepository();

    await repository.saveToday({
      userId: "user-1",
      date: "2026-04-09",
      imagePath: "file://user-1.jpg",
    });
    await repository.saveToday({
      userId: "user-2",
      date: "2026-04-09",
      imagePath: "file://user-2.jpg",
    });

    await expect(
      repository.listByMonth("user-1", "2026-04"),
    ).resolves.toMatchObject([
      {
        userId: "user-1",
        imagePath: "file://user-1.jpg",
      },
    ]);
    await expect(
      repository.listByMonth("user-2", "2026-04"),
    ).resolves.toMatchObject([
      {
        userId: "user-2",
        imagePath: "file://user-2.jpg",
      },
    ]);
  });

  it("deletes a daily photo by user and date", async () => {
    const repository = createLocalDailyPhotoRepository();

    await repository.saveToday({
      userId: "user-1",
      date: "2026-04-09",
      imagePath: "file://user-1.jpg",
      storageKey: "user-1/2026-04-09.jpg",
    });
    await repository.saveToday({
      userId: "user-2",
      date: "2026-04-09",
      imagePath: "file://user-2.jpg",
      storageKey: "user-2/2026-04-09.jpg",
    });

    await expect(
      repository.deleteByDate("user-1", "2026-04-09"),
    ).resolves.toMatchObject({
      userId: "user-1",
      date: "2026-04-09",
      storageKey: "user-1/2026-04-09.jpg",
    });

    await expect(repository.listByMonth("user-1", "2026-04")).resolves.toEqual(
      [],
    );
    await expect(
      repository.listByMonth("user-2", "2026-04"),
    ).resolves.toHaveLength(1);
  });
});

function createFakeMetadataStore(
  initialPhotos: DailyPhoto[] = [],
): DailyPhotoMetadataStore {
  let photos = [...initialPhotos];

  return {
    async load() {
      return photos;
    },
    async save(nextPhotos) {
      photos = [...nextPhotos];
    },
  };
}
