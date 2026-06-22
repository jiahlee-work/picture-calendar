export type StickerAsset = {
  id: string;
  userId: string;
  imagePath: string;
  name?: string;
  width: number;
  height: number;
  createdAt: string;
};

export type CalendarSticker = {
  id: string;
  userId: string;
  month: string;
  stickerAssetId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  opacity: number;
};
