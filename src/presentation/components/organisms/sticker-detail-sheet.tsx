import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type {
  StickerAsset,
  UserStickerAsset,
} from "@/application/services/stickers/types";
import { AppBottomSheetBackdrop } from "@/presentation/components/atoms/app-bottom-sheet-backdrop";
import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
import { StickerAssetPreview } from "@/presentation/features/stickers/sticker-asset-preview";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";
import { appSpacing } from "@/presentation/theme/spacing";

type StickerDetailSheetProps = {
  asset: StickerAsset | null;
  isSaving: boolean;
  visible: boolean;
  onClose: () => void;
  onDeleteUserSticker: (asset: UserStickerAsset) => Promise<boolean>;
  onToggleUserStickerFavorite: (asset: UserStickerAsset) => Promise<boolean>;
};

export function StickerDetailSheet(props: StickerDetailSheetProps) {
  const {
    asset,
    isSaving,
    onClose,
    onDeleteUserSticker,
    onToggleUserStickerFavorite,
    visible,
  } = props;
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["46%"], []);

  useEffect(() => {
    if (visible && asset) {
      bottomSheetRef.current?.present();
      return;
    }

    bottomSheetRef.current?.dismiss();
  }, [asset, visible]);

  if (!asset) {
    return null;
  }

  const handleClose = () => {
    bottomSheetRef.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      backdropComponent={AppBottomSheetBackdrop}
      backgroundStyle={styles.sheetBackground}
      containerStyle={styles.sheetContainer}
      enableDynamicSizing={false}
      enablePanDownToClose
      handleIndicatorStyle={styles.handleIndicator}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
    >
      <StickerDetailSheetContent
        key={asset.id}
        asset={asset}
        isSaving={isSaving}
        paddingBottom={Math.max(insets.bottom, 18) + 10}
        onClose={handleClose}
        onDeleteUserSticker={onDeleteUserSticker}
        onToggleUserStickerFavorite={onToggleUserStickerFavorite}
      />
    </BottomSheetModal>
  );
}

function StickerDetailSheetContent(props: {
  asset: StickerAsset;
  isSaving: boolean;
  paddingBottom: number;
  onClose: () => void;
  onDeleteUserSticker: StickerDetailSheetProps["onDeleteUserSticker"];
  onToggleUserStickerFavorite: StickerDetailSheetProps["onToggleUserStickerFavorite"];
}) {
  const {
    asset,
    isSaving,
    onClose,
    onDeleteUserSticker,
    onToggleUserStickerFavorite,
    paddingBottom,
  } = props;

  const handleFavoritePress = () => {
    if (asset.source !== "user" || isSaving) {
      return;
    }

    void onToggleUserStickerFavorite(asset);
  };

  const handleDeletePress = () => {
    if (asset.source !== "user" || isSaving) {
      return;
    }

    Alert.alert("스티커 삭제", "이 스티커를 삭제할까요?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          void onDeleteUserSticker(asset).then((wasDeleted) => {
            if (wasDeleted) {
              onClose();
            }
          });
        },
      },
    ]);
  };

  return (
    <BottomSheetView style={[styles.content, { paddingBottom }]}>
      <View style={styles.previewPanel}>
        <StickerAssetPreview asset={asset} size="detail" />
        {asset.source === "user" ? (
          <View style={styles.previewActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                asset.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"
              }
              accessibilityState={{ selected: Boolean(asset.isFavorite) }}
              disabled={isSaving}
              style={({ pressed }) => [
                styles.iconButton,
                asset.isFavorite && styles.iconButtonActive,
                isSaving && styles.iconButtonDisabled,
                pressed && !isSaving && styles.iconButtonPressed,
              ]}
              onPress={handleFavoritePress}
            >
              <ReiconIcon
                color={appColors.white}
                name="Star"
                size={24}
                weight={asset.isFavorite ? "Filled" : "Outline"}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="스티커 삭제"
              disabled={isSaving}
              style={({ pressed }) => [
                styles.iconButton,
                isSaving && styles.iconButtonDisabled,
                pressed && !isSaving && styles.iconButtonPressed,
              ]}
              onPress={handleDeletePress}
            >
              <ReiconIcon color={appColors.white} name="Trash5" size={24} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    zIndex: appLayers.bottomSheet,
  },
  sheetBackground: {
    backgroundColor: appColors.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  handleIndicator: {
    backgroundColor: "#D9D9D9",
    height: 4,
    width: 44,
  },
  content: {
    paddingHorizontal: appSpacing.screenHorizontalPadding,
    paddingTop: 14,
  },
  previewPanel: {
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderCurve: "continuous",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 252,
    overflow: "hidden",
    padding: 12,
    position: "relative",
  },
  previewActions: {
    flexDirection: "row",
    gap: 8,
    position: "absolute",
    right: 12,
    top: 12,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: appColors.blackOverlay26,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  iconButtonActive: {
    backgroundColor: appColors.blackOverlay34,
  },
  iconButtonPressed: {
    backgroundColor: appColors.blackOverlay34,
  },
  iconButtonDisabled: {
    opacity: 0.45,
  },
});
