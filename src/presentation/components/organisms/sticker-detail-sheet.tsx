import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useRef } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type {
  StickerAsset,
  UserStickerAsset,
} from "@/application/services/stickers/types";
import { AppBottomSheetBackdrop } from "@/presentation/components/atoms/app-bottom-sheet-backdrop";
import { StickerAssetPreview } from "@/presentation/components/organisms/sticker-asset-preview";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";
import { appSpacing } from "@/presentation/theme/spacing";

export type StickerDetailSheetProps = {
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
      enableDynamicSizing
      enablePanDownToClose
      handleIndicatorStyle={styles.handleIndicator}
      index={0}
      onDismiss={onClose}
    >
      <StickerDetailSheetContent
        key={asset.id}
        asset={asset}
        isSaving={isSaving}
        paddingBottom={Math.max(insets.bottom, 18)}
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
      </View>
      {asset.source === "user" && (
        <View style={styles.actionRow}>
          <DetailActionButton
            accessibilityLabel={
              asset.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"
            }
            disabled={isSaving}
            label={asset.isFavorite ? "북마크 해제" : "북마크"}
            selected={Boolean(asset.isFavorite)}
            onPress={handleFavoritePress}
          />
          <DetailActionButton
            accessibilityLabel="스티커 삭제"
            disabled={isSaving}
            label="삭제"
            onPress={handleDeletePress}
          />
        </View>
      )}
    </BottomSheetView>
  );
}

function DetailActionButton(props: {
  accessibilityLabel: string;
  disabled: boolean;
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const {
    accessibilityLabel,
    disabled,
    label,
    onPress,
    selected = false,
  } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        selected && styles.actionButtonSelected,
        disabled && styles.actionButtonDisabled,
        pressed && !disabled && styles.actionButtonPressed,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.actionButtonLabel,
          selected && styles.actionButtonSelectedLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
    gap: 14,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
    paddingTop: 14,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: appColors.white,
    borderColor: "#D1D5DB",
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionButtonLabel: {
    color: appColors.black,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
  },
  actionButtonPressed: {
    opacity: 0.78,
  },
  actionButtonSelected: {
    backgroundColor: appColors.black,
    borderColor: appColors.black,
  },
  actionButtonSelectedLabel: {
    color: appColors.white,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
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
});
