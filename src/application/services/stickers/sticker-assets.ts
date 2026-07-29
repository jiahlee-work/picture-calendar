import type {
  BuiltInStickerAsset,
  StickerAsset,
  StickerRepository,
} from "@/application/services/stickers/types";

export const BUILT_IN_STICKER_ASSETS: BuiltInStickerAsset[] = [
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

export async function listStickerAssets(
  repository: StickerRepository,
  userId: string,
): Promise<StickerAsset[]> {
  const userAssets = await repository.listUserAssets(userId);

  return [...BUILT_IN_STICKER_ASSETS, ...userAssets];
}
