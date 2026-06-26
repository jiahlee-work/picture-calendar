import type { DailyPhoto, DailyPhotoDraft, DailyPhotoMetadataStore, DailyPhotoRepository } from "@/shared/daily-photo/types";
import { dayjs } from "@/shared/date/dayjs";

type LocalDailyPhotoRepositoryOptions = {
  initialPhotos?: DailyPhoto[];
  metadataStore?: DailyPhotoMetadataStore;
  now?: () => Date;
};

export function createLocalDailyPhotoRepository(options: LocalDailyPhotoRepositoryOptions | DailyPhoto[] = []): DailyPhotoRepository {
  const normalizedOptions = Array.isArray(options) ? { initialPhotos: options } : options;
  const metadataStore = normalizedOptions.metadataStore ?? createMemoryDailyPhotoMetadataStore(normalizedOptions.initialPhotos ?? []);
  const now = normalizedOptions.now ?? (() => dayjs().toDate());

  return {
    async listByMonth(userId, month) {
      const photosByUserDate = await loadPhotosByUserDate(metadataStore);

      return Array.from(photosByUserDate.values()).filter((photo) => photo.userId === userId && photo.date.startsWith(month));
    },
    async hasAny(userId) {
      const photosByUserDate = await loadPhotosByUserDate(metadataStore);

      return Array.from(photosByUserDate.values()).some((photo) => photo.userId === userId);
    },
    async saveToday(photo) {
      const photosByUserDate = await loadPhotosByUserDate(metadataStore);
      const timestamp = now().toISOString();
      const photoKey = toDailyPhotoKey(photo.userId, photo.date);
      const existing = photosByUserDate.get(photoKey);
      const saved = createDailyPhoto(photo, existing, timestamp);

      photosByUserDate.set(photoKey, saved);
      await metadataStore.save(Array.from(photosByUserDate.values()));

      return saved;
    },
    async deleteByDate(userId, date) {
      const photosByUserDate = await loadPhotosByUserDate(metadataStore);
      const photoKey = toDailyPhotoKey(userId, date);
      const deletedPhoto = photosByUserDate.get(photoKey) ?? null;

      if (!deletedPhoto) {
        return null;
      }

      photosByUserDate.delete(photoKey);
      await metadataStore.save(Array.from(photosByUserDate.values()));

      return deletedPhoto;
    },
  };
}

function createMemoryDailyPhotoMetadataStore(initialPhotos: DailyPhoto[]): DailyPhotoMetadataStore {
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

async function loadPhotosByUserDate(metadataStore: DailyPhotoMetadataStore): Promise<Map<string, DailyPhoto>> {
  const photos = await metadataStore.load();

  return new Map(photos.map((photo) => [toDailyPhotoKey(photo.userId, photo.date), photo]));
}

function toDailyPhotoKey(userId: string, date: string): string {
  return `${userId}:${date}`;
}

function createDailyPhoto(photo: DailyPhotoDraft, existing: DailyPhoto | undefined, now: string): DailyPhoto {
  return {
    id: existing?.id ?? `local-${photo.date}`,
    userId: photo.userId,
    date: photo.date,
    imagePath: photo.imagePath,
    localImagePath: photo.localImagePath ?? photo.imagePath,
    remoteImageUrl: photo.remoteImageUrl ?? existing?.remoteImageUrl ?? null,
    storageKey: photo.storageKey ?? existing?.storageKey ?? null,
    syncStatus: photo.syncStatus ?? existing?.syncStatus ?? "local",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    lockedAt: existing?.lockedAt ?? null,
  };
}
