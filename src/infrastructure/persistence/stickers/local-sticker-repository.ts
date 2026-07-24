import type {
  StickerFileStore,
  StickerMetadataStore,
  StickerRepository,
  UserStickerAsset,
  UserStickerAssetDraft,
} from "@/shared/stickers/types";
import { DEFAULT_BUILT_IN_STICKER_ASSETS } from "@/shared/stickers/types";
import { dayjs } from "@/shared/date/dayjs";

type LocalStickerRepositoryOptions = {
  fileStore?: StickerFileStore;
  initialStickers?: UserStickerAsset[];
  metadataStore?: StickerMetadataStore;
  now?: () => Date;
};

export function createLocalStickerRepository(
  options: LocalStickerRepositoryOptions | UserStickerAsset[] = [],
): StickerRepository {
  const normalizedOptions = Array.isArray(options)
    ? { initialStickers: options }
    : options;
  const metadataStore =
    normalizedOptions.metadataStore ??
    createMemoryStickerMetadataStore(normalizedOptions.initialStickers ?? []);
  const now = normalizedOptions.now ?? (() => dayjs().toDate());

  return {
    async listAssets(userId) {
      const userAssets = await listUserStickerAssets(metadataStore, userId);

      return [...DEFAULT_BUILT_IN_STICKER_ASSETS, ...userAssets];
    },
    async listUserAssets(userId) {
      return listUserStickerAssets(metadataStore, userId);
    },
    async saveUserAsset(sticker) {
      const stickersById = await loadStickersById(metadataStore);
      const timestamp = now().toISOString();
      const saved = createUserStickerAsset(
        sticker,
        timestamp,
        stickersById.size,
      );

      stickersById.set(saved.id, saved);
      await metadataStore.save(Array.from(stickersById.values()));

      return saved;
    },
    async deleteUserAsset(userId, assetId) {
      const stickersById = await loadStickersById(metadataStore);
      const deletedSticker = stickersById.get(assetId) ?? null;

      if (!deletedSticker || deletedSticker.userId !== userId) {
        return null;
      }

      stickersById.delete(assetId);
      await metadataStore.save(Array.from(stickersById.values()));

      if (deletedSticker.storageKey && normalizedOptions.fileStore) {
        await normalizedOptions.fileStore.delete(deletedSticker.storageKey);
      }

      return deletedSticker;
    },
  };
}

function createMemoryStickerMetadataStore(
  initialStickers: UserStickerAsset[],
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

async function listUserStickerAssets(
  metadataStore: StickerMetadataStore,
  userId: string,
): Promise<UserStickerAsset[]> {
  const stickers = await metadataStore.load();

  return stickers
    .filter((sticker) => sticker.userId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

async function loadStickersById(
  metadataStore: StickerMetadataStore,
): Promise<Map<string, UserStickerAsset>> {
  const stickers = await metadataStore.load();

  return new Map(stickers.map((sticker) => [sticker.id, sticker]));
}

function createUserStickerAsset(
  sticker: UserStickerAssetDraft,
  now: string,
  stickerCount: number,
): UserStickerAsset {
  return {
    id: `local-sticker-${dayjs(now).valueOf().toString(36)}-${stickerCount.toString(36)}`,
    source: "user",
    userId: sticker.userId,
    imagePath: sticker.imagePath,
    storageKey: sticker.storageKey ?? null,
    name: normalizeOptionalText(sticker.name),
    tags: normalizeTags(sticker.tags),
    createdAt: now,
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function normalizeTags(tags: string[] | undefined): string[] | undefined {
  if (!tags) {
    return undefined;
  }

  const normalizedTags = tags.map((tag) => tag.trim()).filter(Boolean);

  return normalizedTags.length > 0
    ? Array.from(new Set(normalizedTags))
    : undefined;
}
