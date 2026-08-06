import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, type ComponentRef } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { StickerAsset } from "@/application/services/stickers/types";
import { StickerTile } from "@/presentation/components/organisms/sticker-tile";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";
import { appSpacing } from "@/presentation/theme/spacing";

type StickerPickerSheetProps = {
  snapIndex: number;
  stickers: StickerAsset[];
  visible: boolean;
  onChangeSnapIndex: (snapIndex: number) => void;
  onSelectSticker: (asset: StickerAsset) => void;
};

const STICKER_TILE_SIZE = 82;
const MINIMIZED_SHEET_HEIGHT = 72;

export function StickerPickerSheet(props: StickerPickerSheetProps) {
  const { onChangeSnapIndex, onSelectSticker, snapIndex, stickers, visible } =
    props;
  const bottomSheetRef = useRef<ComponentRef<typeof BottomSheet>>(null);
  const snapPoints = useMemo(() => [MINIMIZED_SHEET_HEIGHT, "36%", "90%"], []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    bottomSheetRef.current?.snapToIndex(snapIndex);
  }, [snapIndex, visible]);

  if (!visible) {
    return null;
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      backgroundStyle={styles.sheetBackground}
      containerStyle={styles.sheetContainer}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      handleIndicatorStyle={styles.handleIndicator}
      index={snapIndex}
      snapPoints={snapPoints}
      onChange={onChangeSnapIndex}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Stickers</Text>
      </View>
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {stickers.map((asset) => (
          <StickerTile
            key={asset.id}
            asset={asset}
            isSelectable
            showsSelectionControl={false}
            tileSize={STICKER_TILE_SIZE}
            onOpenDetails={onSelectSticker}
            onToggleSelection={onSelectSticker}
          />
        ))}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 22,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
  },
  handleIndicator: {
    backgroundColor: "#dddddd",
    borderRadius: 2,
    height: 4,
    width: 42,
  },
  header: {
    paddingBottom: 12,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
    paddingTop: 4,
  },
  sheetBackground: {
    backgroundColor: appColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContainer: {
    elevation: appLayers.bottomSheet,
    zIndex: appLayers.bottomSheet,
  },
  title: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22,
  },
});
