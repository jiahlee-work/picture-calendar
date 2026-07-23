import { describe, expect, it } from "vitest";

import { createLocalStickerRepository } from "@/infrastructure/persistence/stickers/local-sticker-repository";
import type {
  StickerFileStore,
  StickerMetadataStore,
  UserStickerAsset,
} from "@/shared/stickers/types";

describe("createLocalStickerRepository", () => {
  it("lists built-in stickers before a user's registered stickers", async () => {
    const repository = createLocalStickerRepository({
      initialStickers: [
        createUserStickerAsset({
          id: "sticker-1",
          userId: "user-1",
          createdAt: "2026-06-02T00:00:00.000Z",
        }),
        createUserStickerAsset({
          id: "sticker-2",
          userId: "user-2",
          createdAt: "2026-06-03T00:00:00.000Z",
        }),
      ],
    });

    const stickers = await repository.listAssets("user-1");

    expect(stickers).toMatchObject([
      { id: "built-in-calendar", source: "builtIn", variant: "calendar" },
      {
        id: "built-in-polaroid-frame",
        source: "builtIn",
        variant: "polaroidFrame",
      },
      { id: "sticker-1", source: "user", userId: "user-1" },
    ]);
  });

  it("persists a user sticker through the configured metadata store", async () => {
    const metadataStore = createFakeMetadataStore();
    const repository = createLocalStickerRepository({
      metadataStore,
      now: () => new Date("2026-06-02T00:00:00.000Z"),
    });

    const savedSticker = await repository.saveUserAsset({
      userId: "user-1",
      imagePath: "file://stickers/user-1/sticker.png",
      storageKey: "user-1/sticker.png",
      name: "  Summer  ",
      tags: [" memo ", "memo", ""],
    });
    const restoredRepository = createLocalStickerRepository({ metadataStore });

    expect(savedSticker).toMatchObject({
      id: "local-sticker-mpvvf9c0-0",
      source: "user",
      userId: "user-1",
      imagePath: "file://stickers/user-1/sticker.png",
      storageKey: "user-1/sticker.png",
      name: "Summer",
      tags: ["memo"],
      createdAt: "2026-06-02T00:00:00.000Z",
    });
    await expect(
      restoredRepository.listUserAssets("user-1"),
    ).resolves.toMatchObject([
      {
        id: "local-sticker-mpvvf9c0-0",
        userId: "user-1",
      },
    ]);
  });

  it("deletes a user's sticker metadata and backing file", async () => {
    const deletedStorageKeys: string[] = [];
    const fileStore = createFakeFileStore(deletedStorageKeys);
    const repository = createLocalStickerRepository({
      fileStore,
      initialStickers: [
        createUserStickerAsset({
          id: "sticker-1",
          userId: "user-1",
          storageKey: "user-1/sticker.png",
        }),
        createUserStickerAsset({
          id: "sticker-2",
          userId: "user-2",
          storageKey: "user-2/sticker.png",
        }),
      ],
    });

    await expect(
      repository.deleteUserAsset("user-1", "sticker-1"),
    ).resolves.toMatchObject({
      id: "sticker-1",
      storageKey: "user-1/sticker.png",
    });

    await expect(repository.listUserAssets("user-1")).resolves.toEqual([]);
    await expect(repository.listUserAssets("user-2")).resolves.toHaveLength(1);
    expect(deletedStorageKeys).toEqual(["user-1/sticker.png"]);
  });

  it("does not delete another user's sticker", async () => {
    const deletedStorageKeys: string[] = [];
    const repository = createLocalStickerRepository({
      fileStore: createFakeFileStore(deletedStorageKeys),
      initialStickers: [
        createUserStickerAsset({
          id: "sticker-1",
          userId: "user-1",
          storageKey: "user-1/sticker.png",
        }),
      ],
    });

    await expect(
      repository.deleteUserAsset("user-2", "sticker-1"),
    ).resolves.toBeNull();

    await expect(repository.listUserAssets("user-1")).resolves.toHaveLength(1);
    expect(deletedStorageKeys).toEqual([]);
  });
});

function createUserStickerAsset(
  overrides: Partial<UserStickerAsset>,
): UserStickerAsset {
  return {
    id: "sticker-1",
    source: "user",
    userId: "user-1",
    imagePath: "file://sticker.png",
    storageKey: "user-1/sticker.png",
    createdAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

function createFakeMetadataStore(
  initialStickers: UserStickerAsset[] = [],
): StickerMetadataStore {
  let stickers = [...initialStickers];

  return {
    async load() {
      return stickers;
    },
    async save(nextStickers) {
      stickers = [...nextStickers];
    },
  };
}

function createFakeFileStore(deletedStorageKeys: string[]): StickerFileStore {
  return {
    async save() {
      return {
        imagePath: "file://sticker.png",
        storageKey: "user-1/sticker.png",
      };
    },
    async delete(storageKey) {
      deletedStorageKeys.push(storageKey);
    },
  };
}
