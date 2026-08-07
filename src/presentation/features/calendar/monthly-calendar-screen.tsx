import { useEffect, useRef, useState } from "react";
import { Alert, type LayoutChangeEvent, StyleSheet, View } from "react-native";

import { useStickerLibrary } from "@/application/hooks/use-sticker-library";
import { useTodayPhotoFlow } from "@/application/hooks/use-today-photo-flow";
import type { StickerAsset } from "@/application/services/stickers/types";
import {
  addNavigableCalendarMonths,
  clampCalendarMonth,
} from "@/application/services/calendar/calendar-month-navigation";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import { DailyPhotoPolicyDialog } from "@/presentation/components/organisms/daily-photo-policy-dialog";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { CalendarWheelPickerSheet } from "@/presentation/components/organisms/calendar-wheel-picker-sheet";
import { DailyPhotoDetailSheet } from "@/presentation/components/organisms/daily-photo-detail-sheet";
import { MonthlyCalendar } from "@/presentation/components/organisms/monthly-calendar";
import { ShareCaptureMenu } from "@/presentation/components/organisms/share-capture-menu";
import { StickerPickerSheet } from "@/presentation/components/organisms/sticker-picker-sheet";
import { appColors } from "@/presentation/theme/colors";
import { appSpacing } from "@/presentation/theme/spacing";
import { dayjs } from "@/shared/date/dayjs";

type ShareContentLayout = {
  height: number;
  width: number;
};

export function MonthlyCalendarScreen() {
  const shareCaptureRef = useRef<View>(null);
  const stickerPickerMountFrameRef = useRef<number | null>(null);
  const hasRequestedStickerPickerMountRef = useRef(false);
  const [activeMonth, setActiveMonth] = useState(() =>
    clampCalendarMonth(dayjs().startOf("month").toDate()),
  );
  const [isYearMonthPickerVisible, setIsYearMonthPickerVisible] =
    useState(false);
  const [isStickerPickerMounted, setIsStickerPickerMounted] = useState(false);
  const [stickerPickerMountKey, setStickerPickerMountKey] = useState(0);
  const [stickerPickerSnapIndex, setStickerPickerSnapIndex] = useState(1);
  const [selectedStickerPickerAssetId, setSelectedStickerPickerAssetId] =
    useState<string | null>(null);
  const [shareContentLayout, setShareContentLayout] =
    useState<ShareContentLayout | null>(null);
  const { registerFromClipboard, registerFromLibrary, stickers } =
    useStickerLibrary();
  const {
    calendar,
    photoDetail,
    policyDialog,
    dismissDialog,
    dismissPhotoDetail,
    handleChangeSelectedPhoto,
    handleDeleteSelectedPhoto,
    handleSelectDate,
  } = useTodayPhotoFlow(activeMonth);
  const isShareReady = calendar.days.length > 0;
  const shareFileName = dayjs(activeMonth).format("YYYY-MM");

  useEffect(() => {
    return () => {
      if (stickerPickerMountFrameRef.current !== null) {
        cancelAnimationFrame(stickerPickerMountFrameRef.current);
      }
    };
  }, []);

  const handlePreviousMonth = () => {
    setActiveMonth((current) => addNavigableCalendarMonths(current, -1));
  };

  const handleNextMonth = () => {
    setActiveMonth((current) => addNavigableCalendarMonths(current, 1));
  };

  const handleOpenYearMonthPicker = () => {
    setIsYearMonthPickerVisible(true);
  };

  const handleCloseYearMonthPicker = () => {
    setIsYearMonthPickerVisible(false);
  };

  const handleConfirmYearMonth = (date: Date) => {
    setActiveMonth(clampCalendarMonth(date));
    setIsYearMonthPickerVisible(false);
  };

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const nextLayout = {
      height: Math.round(event.nativeEvent.layout.height),
      width: Math.round(event.nativeEvent.layout.width),
    };

    setShareContentLayout((currentLayout) => {
      if (
        currentLayout?.height === nextLayout.height &&
        currentLayout.width === nextLayout.width
      ) {
        return currentLayout;
      }

      return nextLayout;
    });

    if (!hasRequestedStickerPickerMountRef.current) {
      hasRequestedStickerPickerMountRef.current = true;
      setIsStickerPickerMounted(false);
      stickerPickerMountFrameRef.current = requestAnimationFrame(() => {
        setStickerPickerMountKey((currentKey) => currentKey + 1);
        setIsStickerPickerMounted(true);
      });
    }
  };

  const handleRequestDeletePhoto = () => {
    Alert.alert(
      "사진 삭제",
      "정말 삭제하시겠습니까? 삭제된 사진은 복구되지 않습니다",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "확인",
          style: "destructive",
          onPress: () => {
            void handleDeleteSelectedPhoto();
          },
        },
      ],
    );
  };
  const handleSelectSticker = (asset: StickerAsset) => {
    setSelectedStickerPickerAssetId(asset.id);
    Alert.alert("선택한 항목", asset.name ?? "스티커");
  };
  const handleRegisterStickerFromLibrary = async () => {
    const result = await registerFromLibrary();

    if (result === "failed") {
      Alert.alert("등록 실패", "스티커 이미지를 저장하지 못했어요.");
    }
  };
  const handleRegisterStickerFromClipboard = async () => {
    const result = await registerFromClipboard();

    if (result === "empty") {
      Alert.alert(
        "이미지 없음",
        "기기 클립보드에서 붙여넣을 이미지를 찾지 못했어요.",
      );
      return;
    }

    if (result === "denied") {
      Alert.alert(
        "권한 필요",
        "클립보드 이미지를 읽을 수 있도록 붙여넣기 권한을 허용해 주세요.",
      );
      return;
    }

    if (result === "nativeModuleUnavailable") {
      Alert.alert(
        "앱 재설치 필요",
        "클립보드 붙여넣기를 사용하려면 expo-clipboard가 포함된 개발용 앱을 다시 빌드해서 설치해야 해요.",
      );
      return;
    }

    if (result === "failed") {
      Alert.alert("등록 실패", "클립보드 이미지를 스티커로 저장하지 못했어요.");
    }
  };

  return (
    <AppSafeAreaView>
      <View style={styles.container} onLayout={handleContainerLayout}>
        <AppBar>
          <AppBar.Title
            accessibilityLabel="연월 선택 열기"
            onPress={handleOpenYearMonthPicker}
          >
            {calendar.title}
          </AppBar.Title>
          <View style={styles.appBarActions}>
            <ShareCaptureMenu
              accessibilityLabel="캘린더 공유 버튼"
              captureRef={shareCaptureRef}
              fileName={shareFileName}
              isReady={isShareReady && Boolean(shareContentLayout)}
            />
          </View>
        </AppBar>
        <View style={styles.content}>
          <MonthlyCalendar
            calendar={calendar}
            canSwipeMonth
            onNextMonth={handleNextMonth}
            onPreviousMonth={handlePreviousMonth}
            onSelectDate={handleSelectDate}
          />
        </View>
      </View>
      {shareContentLayout && (
        <View
          ref={shareCaptureRef}
          collapsable={false}
          pointerEvents="none"
          renderToHardwareTextureAndroid
          style={[
            styles.shareCaptureCanvas,
            {
              height: shareContentLayout.height,
              transform: [{ translateX: -(shareContentLayout.width + 120) }],
              width: shareContentLayout.width,
            },
          ]}
        >
          <View style={styles.shareCalendarContent}>
            <AppBar>
              <AppBar.Title>{calendar.title}</AppBar.Title>
            </AppBar>
            <View style={styles.content}>
              <MonthlyCalendar
                calendar={calendar}
                canSwipeMonth={false}
                contentWidth={shareContentLayout.width}
                onSelectDate={() => {}}
              />
            </View>
          </View>
        </View>
      )}
      <DailyPhotoPolicyDialog dialog={policyDialog} onCancel={dismissDialog} />
      <DailyPhotoDetailSheet
        dateLabel={photoDetail?.dateLabel ?? ""}
        isToday={photoDetail?.isToday ?? false}
        photo={photoDetail?.photo ?? null}
        visible={Boolean(photoDetail)}
        onChangePhoto={handleChangeSelectedPhoto}
        onClose={dismissPhotoDetail}
        onDeletePhoto={handleRequestDeletePhoto}
      />
      {isYearMonthPickerVisible && (
        <CalendarWheelPickerSheet
          value={activeMonth}
          visible={isYearMonthPickerVisible}
          onClose={handleCloseYearMonthPicker}
          onConfirm={handleConfirmYearMonth}
        />
      )}
      {isStickerPickerMounted && (
        <StickerPickerSheet
          key={stickerPickerMountKey}
          selectedAssetId={selectedStickerPickerAssetId}
          snapIndex={stickerPickerSnapIndex}
          stickers={stickers}
          visible
          onChangeSnapIndex={setStickerPickerSnapIndex}
          onRegisterFromClipboard={() => {
            void handleRegisterStickerFromClipboard();
          }}
          onRegisterFromLibrary={() => {
            void handleRegisterStickerFromLibrary();
          }}
          onSelectSticker={handleSelectSticker}
        />
      )}
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  content: {
    flex: 1,
    paddingTop: appSpacing.screenContentTopPadding,
  },
  appBarActions: {
    flexDirection: "row",
    gap: 10,
  },
  shareCaptureCanvas: {
    left: 0,
    position: "absolute",
    top: 0,
  },
  shareCalendarContent: {
    backgroundColor: appColors.background,
    flex: 1,
  },
});
