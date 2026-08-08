import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

import type { StickerAsset } from "@/application/services/stickers/types";
import { Menu } from "@/presentation/components/molecules/menu";
import { UnderlineSegmentedTabs } from "@/presentation/components/molecules/underline-segmented-tabs";
import { StickerTile } from "@/presentation/components/organisms/sticker-tile";
import { getStickerLibraryGridLayout } from "@/presentation/helpers/stickers/sticker-library-layout";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";
import { appSpacing } from "@/presentation/theme/spacing";

const STICKER_PICKER_ASSET_TYPE_OPTIONS = [
  {
    label: "Stickers",
    value: "stickers",
  },
  {
    label: "Widgets",
    value: "widgets",
  },
] as const;

type StickerPickerAssetTypeValue =
  (typeof STICKER_PICKER_ASSET_TYPE_OPTIONS)[number]["value"];

type StickerPickerSheetProps = {
  selectedAssetId?: string | null;
  snapIndex: number;
  stickers: StickerAsset[];
  visible: boolean;
  onChangeSnapIndex: (snapIndex: number) => void;
  onRegisterFromClipboard?: () => void;
  onRegisterFromLibrary?: () => void;
  onSelectSticker: (asset: StickerAsset) => void;
};

const MINIMIZED_SHEET_HEIGHT = 72;
const WIDGET_VARIANTS = ["calendar", "polaroidFrame", "speechBubble"] as const;

export function StickerPickerSheet(props: StickerPickerSheetProps) {
  const {
    onChangeSnapIndex,
    onRegisterFromClipboard,
    onRegisterFromLibrary,
    onSelectSticker,
    selectedAssetId = null,
    snapIndex,
    stickers,
    visible,
  } = props;
  const bottomSheetRef = useRef<ComponentRef<typeof BottomSheet>>(null);
  const [assetTypeValue, setAssetTypeValue] =
    useState<StickerPickerAssetTypeValue>("stickers");
  const { width } = useWindowDimensions();
  const { cardGap, cardWidth } = getStickerLibraryGridLayout(
    width,
    appSpacing.screenHorizontalPadding,
  );
  const snapPoints = useMemo(() => [MINIMIZED_SHEET_HEIGHT, "36%", "90%"], []);
  const widgetAssets = useMemo(
    () =>
      stickers.filter(
        (asset) =>
          asset.source === "widget" && WIDGET_VARIANTS.includes(asset.variant),
      ),
    [stickers],
  );
  const stickerAssets = useMemo(
    () => stickers.filter((asset) => asset.source === "sticker"),
    [stickers],
  );

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
        <Text style={styles.title}>Library</Text>
        {assetTypeValue === "stickers" ? (
          <Menu
            accessibilityLabel="스티커 등록 메뉴 열기"
            trigger={{ icon: "Add" }}
          >
            <Menu.Item
              icon="Gallery"
              label="갤러리에서 등록"
              onPress={() => {
                onRegisterFromLibrary?.();
              }}
            />
            <Menu.Item
              icon="Clipboard"
              label="클립보드 붙여넣기"
              onPress={() => {
                onRegisterFromClipboard?.();
              }}
            />
          </Menu>
        ) : (
          <View style={styles.headerActionPlaceholder} />
        )}
      </View>
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <UnderlineSegmentedTabs
          options={STICKER_PICKER_ASSET_TYPE_OPTIONS}
          value={assetTypeValue}
          onValueChange={setAssetTypeValue}
        />
        {assetTypeValue === "widgets" ? (
          <StickerPickerGrid
            assets={widgetAssets}
            cardGap={cardGap}
            cardWidth={cardWidth}
            emptyText="사용할 수 있는 위젯이 없습니다."
            selectedAssetId={selectedAssetId}
            onSelectSticker={onSelectSticker}
          />
        ) : (
          <StickerPickerGrid
            assets={stickerAssets}
            cardGap={cardGap}
            cardWidth={cardWidth}
            emptyText="등록된 스티커가 없습니다."
            selectedAssetId={selectedAssetId}
            onSelectSticker={onSelectSticker}
          />
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

function StickerPickerGrid(props: {
  assets: StickerAsset[];
  cardGap: number;
  cardWidth: number;
  emptyText: string;
  selectedAssetId: string | null;
  onSelectSticker: (asset: StickerAsset) => void;
}) {
  const {
    assets,
    cardGap,
    cardWidth,
    emptyText,
    onSelectSticker,
    selectedAssetId,
  } = props;

  if (assets.length === 0) {
    return (
      <View style={styles.emptyPanel}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.grid, { gap: cardGap }]}>
      {assets.map((asset) => (
        <StickerTile
          key={asset.id}
          asset={asset}
          isSelectable
          isSelected={asset.id === selectedAssetId}
          showsSelectionControl
          tileSize={cardWidth}
          onOpenDetails={onSelectSticker}
          onToggleSelection={onSelectSticker}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
    paddingBottom: 34,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
  },
  emptyPanel: {
    alignItems: "center",
    backgroundColor: "rgba(18,18,18,0.04)",
    borderCurve: "continuous",
    borderRadius: 12,
    minHeight: 120,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  emptyText: {
    color: appColors.blackOverlay34,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  handleIndicator: {
    backgroundColor: "#dddddd",
    borderRadius: 2,
    height: 4,
    width: 42,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 18,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
    paddingTop: 4,
  },
  headerActionPlaceholder: {
    height: 40,
    width: 40,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40,
  },
});
