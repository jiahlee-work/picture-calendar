export type WidgetVariant =
  "calendar" | "polaroidFrame" | "polaroidFramePortrait" | "speechBubble";

export type StickerPlacementPageType = "calendar" | "calendarRecap";

export type UserStickerAsset = {
  id: string;
  source: "sticker";
  userId: string;
  imagePath: string;
  storageKey: string | null;
  name?: string;
  tags?: string[];
  isFavorite?: boolean;
  createdAt: string;
};

export type WidgetAsset = {
  id: string;
  source: "widget";
  name: string;
  variant: WidgetVariant;
  tags?: string[];
};

export type StickerAsset = UserStickerAsset | WidgetAsset;

export type StickerPlacement = {
  id: string;
  assetId: string;
  pageType: StickerPlacementPageType;
  pageId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  opacity?: number;
  widgetState?: WidgetPlacementState;
};

export type WidgetPlacementState =
  | {
      variant: "calendar";
      date?: string;
    }
  | {
      variant: "polaroidFrame";
      selectedImageId?: string;
    }
  | {
      variant: "polaroidFramePortrait";
      selectedImageId?: string;
    }
  | {
      variant: "speechBubble";
      text?: string;
    };

export type StoredStickerPlacement = StickerPlacement & {
  userId: string;
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

export type StickerPlacementMetadataStore = {
  load: () => Promise<StoredStickerPlacement[]>;
  save: (placements: StoredStickerPlacement[]) => Promise<void>;
};

export type StickerRepository = {
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

export type StickerPlacementRepository = {
  listByPage: (
    userId: string,
    pageType: StickerPlacementPageType,
    pageId: string,
  ) => Promise<StickerPlacement[]>;
  savePagePlacements: (
    userId: string,
    pageType: StickerPlacementPageType,
    pageId: string,
    placements: StickerPlacement[],
  ) => Promise<StickerPlacement[]>;
  deletePagePlacements: (
    userId: string,
    pageType: StickerPlacementPageType,
    pageId: string,
  ) => Promise<StickerPlacement[]>;
};
