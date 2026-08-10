const STICKER_LIBRARY_CARD_GAP = 12;

export type StickerLibraryGridLayout = {
  cardGap: number;
  cardWidth: number;
};

export function getStickerLibraryGridLayout(
  windowWidth: number,
  screenHorizontalPadding: number,
): StickerLibraryGridLayout {
  const contentWidth = windowWidth - screenHorizontalPadding * 2;
  const columnCount = contentWidth >= 720 ? 4 : 3;
  const totalGap = STICKER_LIBRARY_CARD_GAP * (columnCount - 1);
  const cardWidth = Math.floor((contentWidth - totalGap) / columnCount);

  return {
    cardGap: STICKER_LIBRARY_CARD_GAP,
    cardWidth,
  };
}
