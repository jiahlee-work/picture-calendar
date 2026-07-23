import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import {
  MonthlyRecapDetailStatus,
  useMonthlyRecapDetail,
} from "@/application/hooks/use-monthly-recap-detail";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import type { ReiconName } from "@/presentation/components/atoms/reicon-icon";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { MonthlyRecapTemplate } from "@/presentation/components/templates/monthly-recap-template";
import { ShareCaptureMenu } from "@/presentation/components/organisms/share-capture-menu";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

type RecapMonthDetailScreenProps = {
  month: string;
  year: string;
};

const BACK_ICON: ReiconName = "ArrowLeft";

export function RecapMonthDetailScreen(props: RecapMonthDetailScreenProps) {
  const { month, year } = props;
  const { height, width } = useWindowDimensions();
  const router = useRouter();
  const shareCaptureRef = useRef<View>(null);
  const monthKey = `${year}-${month}`;
  const { photos, recap, status } = useMonthlyRecapDetail(monthKey);
  const monthDate = dayjs(`${year}-${month}-01`);
  const canvasWidth = width;
  const canvasHeight = height;
  const isShareReady = status === MonthlyRecapDetailStatus.ready;

  useEffect(() => {
    if (status === MonthlyRecapDetailStatus.needsSelection) {
      router.replace({
        params: {
          month: monthKey,
        },
        pathname: "/recap/select",
      });
      return;
    }

    if (
      status === MonthlyRecapDetailStatus.collecting ||
      status === MonthlyRecapDetailStatus.empty ||
      status === MonthlyRecapDetailStatus.error
    ) {
      router.replace("/recap");
    }
  }, [monthKey, router, status]);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/recap");
  };

  if (!recap) {
    return (
      <View style={styles.screen}>
        <AppSafeAreaView edges={["top"]} variant="inset">
          <AppBar>
            <AppBar.Action
              accessibilityLabel="리캡 목록으로 돌아가기"
              icon={BACK_ICON}
              onPress={handleBackPress}
            />
            <AppBar.Spacer />
          </AppBar>
        </AppSafeAreaView>
        <View style={styles.fallbackContainer}>
          <ActivityIndicator color={appColors.black} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.templateLayer}>
        <MonthlyRecapTemplate
          monthDate={monthDate}
          photos={photos}
          recap={recap}
          width={canvasWidth}
        />
      </View>
      <View
        ref={shareCaptureRef}
        accessibilityElementsHidden
        collapsable={false}
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        renderToHardwareTextureAndroid
        style={[
          styles.shareCaptureCanvas,
          {
            height: canvasHeight,
            transform: [{ translateX: -(canvasWidth + 120) }],
            width: canvasWidth,
          },
        ]}
      >
        <MonthlyRecapTemplate
          monthDate={monthDate}
          photos={photos}
          recap={recap}
          width={canvasWidth}
        />
      </View>
      <AppSafeAreaView
        edges={["top"]}
        pointerEvents="box-none"
        variant="overlay"
      >
        <AppBar pointerEvents="box-none" variant="overlay">
          <AppBar.Action
            accessibilityLabel="리캡 목록으로 돌아가기"
            icon={BACK_ICON}
            onPress={handleBackPress}
          />
          <AppBar.Spacer />
          <View pointerEvents="box-none" style={styles.appBarActions}>
            <ShareCaptureMenu
              accessibilityLabel="리캡 공유 버튼"
              captureHeight={canvasHeight}
              captureRef={shareCaptureRef}
              captureWidth={canvasWidth}
              fileName={monthKey}
              isReady={isShareReady}
            />
          </View>
        </AppBar>
      </AppSafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  appBarActions: {
    flexDirection: "row",
    gap: 10,
  },
  fallbackContainer: {
    flex: 1,
  },
  screen: {
    backgroundColor: appColors.background,
    flex: 1,
  },
  shareCaptureCanvas: {
    left: 0,
    position: "absolute",
    top: 0,
  },
  templateLayer: {
    height: "100%",
  },
});
