import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef } from "react";
import {
  Platform,
  Pressable,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { AppBottomSheetBackdrop } from "@/presentation/components/atoms/app-bottom-sheet-backdrop";
import { DailyPhotoImage } from "@/presentation/components/atoms/daily-photo-image";
import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";

type DailyPhotoDetailSheetProps = {
  dateLabel: string;
  isToday: boolean;
  photo: DailyPhoto | null;
  showActions?: boolean;
  visible: boolean;
  onChangePhoto: () => void;
  onClose: () => void;
  onDeletePhoto: () => void;
};

export function DailyPhotoDetailSheet(props: DailyPhotoDetailSheetProps) {
  const {
    dateLabel,
    isToday,
    photo,
    showActions = true,
    visible,
    onChangePhoto,
    onClose,
    onDeletePhoto,
  } = props;
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = windowHeight * 0.9;
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["90%"], []);

  useEffect(() => {
    if (visible && photo) {
      bottomSheetRef.current?.present();
      return;
    }

    bottomSheetRef.current?.dismiss();
  }, [photo, visible]);

  useEffect(() => {
    if (Platform.OS !== "android" || !visible) {
      return;
    }

    NativeStatusBar.setBarStyle("light-content");
    NativeStatusBar.setBackgroundColor("transparent");
    NativeStatusBar.setTranslucent(true);

    return () => {
      NativeStatusBar.setBarStyle("dark-content");
      NativeStatusBar.setBackgroundColor(appColors.background);
      NativeStatusBar.setTranslucent(false);
    };
  }, [visible]);

  if (!photo) {
    return null;
  }

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
      <BottomSheetView style={[styles.content, { height: sheetHeight }]}>
        <DailyPhotoImage imagePath={photo.imagePath} />
        <View style={styles.topOverlay}>
          <View style={styles.topSpacer} />
          <Text style={styles.dateText}>{dateLabel}</Text>
          {showActions ? (
            <Pressable
              accessibilityLabel="사진 삭제"
              style={styles.iconButton}
              onPress={onDeletePhoto}
            >
              <ReiconIcon
                color="#ffffff"
                name="Trash5"
                size={20}
              />
            </Pressable>
          ) : (
            <View style={styles.topSpacer} />
          )}
        </View>
        {showActions && isToday && (
          <View style={[styles.bottomOverlay, { bottom: insets.bottom + 22 }]}>
            <Pressable
              accessibilityLabel="사진 변경"
              style={styles.changePanel}
              onPress={onChangePhoto}
            >
              <Text style={styles.policyText}>
                오늘 안에는 사진을 바꿀 수 있어요.
              </Text>
              <View style={styles.galleryIcon}>
                <ReiconIcon
                  color="#ffffff"
                  name="Gallery"
                  size={24}
                />
              </View>
            </Pressable>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    elevation: appLayers.bottomSheet,
    zIndex: appLayers.bottomSheet,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  sheetBackground: {
    backgroundColor: appColors.black,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  content: {
    flex: 1,
    overflow: "hidden",
  },
  topOverlay: {
    alignItems: "center",
    elevation: 2,
    flexDirection: "row",
    gap: 12,
    left: 0,
    minHeight: 64,
    paddingBottom: 10,
    paddingHorizontal: 18,
    paddingTop: 10,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 2,
  },
  dateText: {
    color: "#ffffff",
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 24,
    textAlign: "center",
  },
  topSpacer: {
    height: 44,
    width: 44,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: appColors.blackOverlay34,
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 22,
    borderWidth: 1,
    elevation: 3,
    height: 40,
    justifyContent: "center",
    width: 40,
    zIndex: 3,
  },
  bottomOverlay: {
    elevation: 2,
    left: 0,
    paddingHorizontal: 22,
    position: "absolute",
    right: 0,
    zIndex: 2,
  },
  changePanel: {
    alignItems: "center",
    backgroundColor: appColors.blackOverlay34,
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
    minHeight: 54,
    paddingLeft: 18,
    paddingRight: 10,
  },
  policyText: {
    color: "#ffffff",
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  galleryIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
});
