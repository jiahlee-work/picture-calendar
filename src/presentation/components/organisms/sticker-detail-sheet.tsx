import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import type {
  StickerAsset,
  UserStickerAsset,
} from "@/application/services/stickers/types";
import { translate } from "@/application/services/localization/app-i18n";
import { AppBottomSheetBackdrop } from "@/presentation/components/atoms/app-bottom-sheet-backdrop";
import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
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
};

export function StickerDetailSheet(props: StickerDetailSheetProps) {
  const { asset, isSaving, onClose, onDeleteUserSticker, visible } = props;
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = windowHeight * 0.9;
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["90%"], []);

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
      handleComponent={null}
      index={0}
      snapPoints={snapPoints}
      style={styles.sheet}
      onDismiss={onClose}
    >
      <StickerDetailSheetContent
        key={asset.id}
        asset={asset}
        isSaving={isSaving}
        paddingBottom={Math.max(insets.bottom, 18)}
        sheetHeight={sheetHeight}
        onClose={handleClose}
        onDeleteUserSticker={onDeleteUserSticker}
      />
    </BottomSheetModal>
  );
}

function StickerDetailSheetContent(props: {
  asset: StickerAsset;
  isSaving: boolean;
  paddingBottom: number;
  sheetHeight: number;
  onClose: () => void;
  onDeleteUserSticker: StickerDetailSheetProps["onDeleteUserSticker"];
}) {
  const {
    asset,
    isSaving,
    onClose,
    onDeleteUserSticker,
    paddingBottom,
    sheetHeight,
  } = props;
  const [isDeleting, setIsDeleting] = useState(false);
  const isActionPending = isSaving || isDeleting;

  const handleDeletePress = () => {
    if (asset.source !== "sticker" || isActionPending) {
      return;
    }

    Alert.alert(
      translate("stickers.deleteTitle"),
      translate("stickers.deleteOneMessage"),
      [
        {
          text: translate("common.cancel"),
          style: "cancel",
        },
        {
          text: translate("common.delete"),
          style: "destructive",
          onPress: () => {
            setIsDeleting(true);
            void onDeleteUserSticker(asset)
              .then((wasDeleted) => {
                if (wasDeleted) {
                  onClose();
                }
              })
              .finally(() => {
                setIsDeleting(false);
              });
          },
        },
      ],
    );
  };

  return (
    <BottomSheetView
      style={[styles.content, { height: sheetHeight, paddingBottom }]}
    >
      <View style={styles.previewPanel}>
        <StickerAssetPreview asset={asset} size="detail" />
        {asset.source === "sticker" && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate("stickers.deleteTitle")}
            accessibilityState={{ busy: isDeleting, disabled: isActionPending }}
            disabled={isActionPending}
            hitSlop={6}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && !isActionPending && styles.deleteButtonPressed,
              isActionPending && styles.deleteButtonDisabled,
            ]}
            onPress={handleDeletePress}
          >
            {isDeleting ? (
              <ActivityIndicator color={appColors.white} size="small" />
            ) : (
              <ReiconIcon color={appColors.white} name="Trash5" size={20} />
            )}
          </Pressable>
        )}
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    zIndex: appLayers.bottomSheet,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  sheetBackground: {
    backgroundColor: appColors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  content: {
    paddingHorizontal: appSpacing.screenHorizontalPadding,
    paddingTop: appSpacing.screenHorizontalPadding,
  },
  deleteButton: {
    alignItems: "center",
    backgroundColor: appColors.blackOverlay34,
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 22,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    top: 12,
    width: 40,
    zIndex: 2,
  },
  deleteButtonPressed: {
    opacity: 0.78,
  },
  deleteButtonDisabled: {
    opacity: 0.45,
  },
  previewPanel: {
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderCurve: "continuous",
    borderRadius: 18,
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
    padding: 12,
    position: "relative",
  },
});
