import type {
  WidgetAsset,
  StickerAsset,
  StickerRepository,
} from "@/application/services/stickers/types";

export const WIDGET_ASSETS: WidgetAsset[] = [
  {
    id: "widget-calendar",
    source: "widget",
    name: "달력",
    variant: "calendar",
    tags: ["calendar"],
  },
  {
    id: "widget-polaroid-frame",
    source: "widget",
    name: "폴라로이드 프레임",
    variant: "polaroidFrame",
    tags: ["polaroid", "photo"],
  },
  {
    id: "widget-polaroid-frame-portrait",
    source: "widget",
    name: "세로형 폴라로이드 프레임",
    variant: "polaroidFramePortrait",
    tags: ["polaroid", "photo", "portrait"],
  },
  {
    id: "widget-speech-bubble",
    source: "widget",
    name: "말풍선",
    variant: "speechBubble",
    tags: ["speech", "text"],
  },
];

export async function listStickerAssets(
  repository: StickerRepository,
  userId: string,
): Promise<StickerAsset[]> {
  const userAssets = await repository.listUserAssets(userId);

  return [...WIDGET_ASSETS, ...userAssets];
}

export function partitionStickerAssets(assets: StickerAsset[]): {
  stickers: Extract<StickerAsset, { source: "sticker" }>[];
  widgets: Extract<StickerAsset, { source: "widget" }>[];
} {
  const stickers: Extract<StickerAsset, { source: "sticker" }>[] = [];
  const widgets: Extract<StickerAsset, { source: "widget" }>[] = [];

  for (const asset of assets) {
    if (asset.source === "sticker") {
      stickers.push(asset);
    } else {
      widgets.push(asset);
    }
  }

  return { stickers, widgets };
}
