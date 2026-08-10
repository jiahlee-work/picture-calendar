import BottomSheet, {
  useBottomSheet,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated";

import type { StickerAsset } from "@/application/services/stickers/types";
import { Menu } from "@/presentation/components/molecules/menu";
import {
  ReiconIcon,
  type ReiconName,
} from "@/presentation/components/atoms/reicon-icon";
import { StickerTile } from "@/presentation/components/organisms/sticker-tile";
import { getStickerLibraryGridLayout } from "@/presentation/helpers/stickers/sticker-library-layout";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";
import { appSpacing } from "@/presentation/theme/spacing";

type StickerPickerSheetProps = {
  snapIndex: number;
  stickers: StickerAsset[];
  visible: boolean;
  onChangeSnapIndex: (snapIndex: number) => void;
  onClose: () => void;
  onRegisterFromClipboard?: () => void;
  onRegisterFromLibrary?: () => void;
  onSelectSticker: (asset: StickerAsset) => void;
};

const WIDGET_VARIANTS = [
  "calendar",
  "polaroidFrame",
  "polaroidFramePortrait",
  "speechBubble",
] as const;

export function StickerPickerSheet(props: StickerPickerSheetProps) {
  const {
    onChangeSnapIndex,
    onClose,
    onRegisterFromClipboard,
    onRegisterFromLibrary,
    onSelectSticker,
    snapIndex,
    stickers,
    visible,
  } = props;
  const bottomSheetRef = useRef<ComponentRef<typeof BottomSheet>>(null);
  const [assetTypeValue, setAssetTypeValue] = useState<"stickers" | "widgets">(
    "stickers",
  );
  const [isRegisterMenuOpen, setIsRegisterMenuOpen] = useState(false);
  const { width } = useWindowDimensions();
  const { cardGap, cardWidth } = getStickerLibraryGridLayout(
    width,
    appSpacing.screenHorizontalPadding,
  );
  const snapPoints = useMemo(() => ["36%", "90%"], []);
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
      backgroundComponent={StickerPickerSheetBackground}
      backdropComponent={StickerPickerSheetBackdrop}
      containerStyle={styles.sheetContainer}
      enableDynamicSizing={false}
      enablePanDownToClose
      handleComponent={() => (
        <StickerPickerSheetHandle isDimmed={isRegisterMenuOpen} />
      )}
      index={snapIndex}
      snapPoints={snapPoints}
      onChange={(nextIndex) => {
        if (nextIndex === -1) {
          onClose();
          return;
        }

        onChangeSnapIndex(nextIndex);
      }}
      onClose={onClose}
    >
      <View style={styles.header}>
        <View style={styles.assetTypeActions}>
          <AssetTypeButton
            accessibilityLabel="스티커 보기"
            icon="StickerSmile"
            isSelected={assetTypeValue === "stickers"}
            onPress={() => setAssetTypeValue("stickers")}
          />
          <AssetTypeButton
            accessibilityLabel="위젯 보기"
            icon="Widget6"
            isSelected={assetTypeValue === "widgets"}
            onPress={() => setAssetTypeValue("widgets")}
          />
        </View>
        {assetTypeValue === "stickers" ? (
          <Menu
            accessibilityLabel="스티커 등록 메뉴 열기"
            onOpenChange={setIsRegisterMenuOpen}
            trigger={({ isOpen, toggle }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="스티커 등록 메뉴 열기"
                accessibilityState={{ expanded: isOpen }}
                style={({ pressed }) => [
                  styles.assetTypeButton,
                  styles.assetTypeButtonSelected,
                  pressed && styles.assetTypeButtonPressed,
                ]}
                onPress={toggle}
              >
                <ReiconIcon color={appColors.black} name="Add" size={24} />
              </Pressable>
            )}
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
        {assetTypeValue === "widgets" ? (
          <StickerPickerGrid
            assets={widgetAssets}
            cardGap={cardGap}
            cardWidth={cardWidth}
            emptyText="사용할 수 있는 위젯이 없습니다."
            onSelectSticker={onSelectSticker}
          />
        ) : (
          <StickerPickerGrid
            assets={stickerAssets}
            cardGap={cardGap}
            cardWidth={cardWidth}
            emptyText="등록된 스티커가 없습니다."
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
  onSelectSticker: (asset: StickerAsset) => void;
}) {
  const { assets, cardGap, cardWidth, emptyText, onSelectSticker } = props;

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
          showsSelectionControl={false}
          tileSize={cardWidth}
          onOpenDetails={onSelectSticker}
          onToggleSelection={onSelectSticker}
        />
      ))}
    </View>
  );
}

function AssetTypeButton(props: {
  accessibilityLabel: string;
  icon: ReiconName;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { accessibilityLabel, icon, isSelected, onPress } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isSelected }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.assetTypeButton,
        isSelected && styles.assetTypeButtonSelected,
        pressed && styles.assetTypeButtonPressed,
      ]}
      onPress={onPress}
    >
      <ReiconIcon color={appColors.black} name={icon} size={24} />
    </Pressable>
  );
}

function StickerPickerSheetBackground(props: BottomSheetBackgroundProps) {
  const { animatedIndex, pointerEvents, style } = props;
  const animatedStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(
        animatedIndex.value,
        [0, 1],
        [appColors.background, appColors.white],
      ),
    }),
    [animatedIndex],
  );

  return (
    <Animated.View
      pointerEvents={pointerEvents}
      style={[style, styles.sheetBackground, animatedStyle]}
    />
  );
}

function StickerPickerSheetBackdrop(props: BottomSheetBackdropProps) {
  const { animatedIndex, style } = props;
  const { close } = useBottomSheet();
  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(
        animatedIndex.value,
        [0, 1],
        [0, 0.35],
        Extrapolation.CLAMP,
      ),
    }),
    [animatedIndex],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="스티커 선택창 닫기"
      style={[StyleSheet.absoluteFill, style, styles.backdropTouchTarget]}
      onPress={() => close()}
    >
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.backdropDim, animatedStyle]}
      />
    </Pressable>
  );
}

function StickerPickerSheetHandle(props: { isDimmed: boolean }) {
  const { isDimmed } = props;

  return (
    <View style={[styles.handle, isDimmed && styles.handleDimmed]}>
      <View style={styles.handleIndicator} />
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
  handle: {
    alignItems: "center",
    padding: 10,
    width: "100%",
  },
  handleDimmed: {
    backgroundColor: appColors.blackOverlay26,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 18,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
    paddingTop: 4,
  },
  assetTypeActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  assetTypeButton: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  assetTypeButtonSelected: {
    backgroundColor: "rgba(18,18,18,0.08)",
  },
  assetTypeButtonPressed: {
    opacity: 0.5,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  backdropDim: {
    backgroundColor: appColors.black,
  },
  backdropTouchTarget: {
    elevation: appLayers.bottomSheet,
    zIndex: appLayers.bottomSheet,
  },
  sheetContainer: {
    elevation: appLayers.bottomSheet,
    zIndex: appLayers.bottomSheet,
  },
});
