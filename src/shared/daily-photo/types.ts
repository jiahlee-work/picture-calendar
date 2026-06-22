export type DailyPhoto = {
  id: string;
  userId: string;
  date: string;
  imagePath: string;
  localImagePath: string;
  remoteImageUrl: string | null;
  storageKey: string | null;
  syncStatus: DailyPhotoSyncStatus;
  createdAt: string;
  updatedAt: string;
  lockedAt: string | null;
};

export type DailyPhotoDraft = {
  userId: string;
  date: string;
  imagePath: string;
  localImagePath?: string;
  remoteImageUrl?: string | null;
  storageKey?: string | null;
  syncStatus?: DailyPhotoSyncStatus;
};

export type DailyPhotoRepository = {
  listByMonth: (userId: string, month: string) => Promise<DailyPhoto[]>;
  hasAny: (userId: string) => Promise<boolean>;
  saveToday: (photo: DailyPhotoDraft) => Promise<DailyPhoto>;
};

export type DailyPhotoSyncStatus = "local" | "syncing" | "synced" | "failed";

export type DailyPhotoMetadataStore = {
  load: () => Promise<DailyPhoto[]>;
  save: (photos: DailyPhoto[]) => Promise<void>;
};

export type StoredDailyPhotoFile = {
  imagePath: string;
  localImagePath: string;
  remoteImageUrl: string | null;
  storageKey: string;
  syncStatus: DailyPhotoSyncStatus;
};

export type DailyPhotoFileStore = {
  save: (photo: {
    base64?: string | null;
    fileName?: string | null;
    userId: string;
    date: string;
    mimeType?: string | null;
    sourceUri: string;
  }) => Promise<StoredDailyPhotoFile>;
  delete: (storageKey: string) => Promise<void>;
};
