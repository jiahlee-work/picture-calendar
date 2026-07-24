export type BuiltInStickerVariant = "calendar" | "polaroidFrame";

export type UserStickerAsset = {
  id: string;
  source: "user";
  userId: string;
  imagePath: string;
  storageKey: string | null;
  name?: string;
  tags?: string[];
  isFavorite?: boolean;
  createdAt: string;
};

export type BuiltInStickerAsset = {
  id: string;
  source: "builtIn";
  name: string;
  variant: BuiltInStickerVariant;
  tags?: string[];
};

export type StickerAsset = UserStickerAsset | BuiltInStickerAsset;

export type StickerPlacement = {
  id: string;
  assetId: string;
  pageType: "calendar" | "calendarRecap";
  pageId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  opacity?: number;
  builtInState?: BuiltInStickerPlacementState;
};

export type BuiltInStickerPlacementState =
  | {
      variant: "calendar";
      date?: string;
    }
  | {
      variant: "polaroidFrame";
      selectedImageId?: string;
    };

export type UserStickerAssetDraft = {
  userId: string;
  imagePath: string;
  storageKey?: string | null;
  name?: string;
  tags?: string[];
};

export type UserStickerAssetUpdate = {
  name?: string;
  tags?: string[];
  isFavorite?: boolean;
};

export type StoredStickerFile = {
  imagePath: string;
  storageKey: string;
};

export type StickerFileStore = {
  save: (sticker: {
    base64?: string | null;
    fileName?: string | null;
    userId: string;
    mimeType?: string | null;
    sourceUri: string;
  }) => Promise<StoredStickerFile>;
  delete: (storageKey: string) => Promise<void>;
};

export type StickerMetadataStore = {
  load: () => Promise<UserStickerAsset[]>;
  save: (stickers: UserStickerAsset[]) => Promise<void>;
};

export type StickerRepository = {
  listAssets: (userId: string) => Promise<StickerAsset[]>;
  listUserAssets: (userId: string) => Promise<UserStickerAsset[]>;
  saveUserAsset: (sticker: UserStickerAssetDraft) => Promise<UserStickerAsset>;
  updateUserAsset: (
    userId: string,
    assetId: string,
    updates: UserStickerAssetUpdate,
  ) => Promise<UserStickerAsset | null>;
  deleteUserAsset: (
    userId: string,
    assetId: string,
  ) => Promise<UserStickerAsset | null>;
};

export const DEFAULT_BUILT_IN_STICKER_ASSETS: BuiltInStickerAsset[] = [
  {
    id: "built-in-calendar",
    source: "builtIn",
    name: "달력",
    variant: "calendar",
    tags: ["calendar"],
  },
  {
    id: "built-in-polaroid-frame",
    source: "builtIn",
    name: "폴라로이드 프레임",
    variant: "polaroidFrame",
    tags: ["polaroid", "photo"],
  },
];
