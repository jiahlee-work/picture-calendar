import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MonthlyRecapDetailStatus, useMonthlyRecapDetail } from "@/application/hooks/use-monthly-recap-detail";
import { MonthlyRecapTemplateFallback } from "@/presentation/components/molecules/monthly-recap-template-fallback";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { MonthlyRecapTemplate } from "@/presentation/components/organisms/monthly-recap-template";
import { ShareCaptureMenu } from "@/presentation/components/organisms/share-capture-menu";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

type RecapMonthDetailScreenProps = {
  month: string;
  year: string;
};

export function RecapMonthDetailScreen(props: RecapMonthDetailScreenProps) {
  const { month, year } = props;
  const { width } = useWindowDimensions();
  const router = useRouter();
  const shareCaptureRef = useRef<View>(null);
  const monthKey = `${year}-${month}`;
  const { photos, recap, status } = useMonthlyRecapDetail(monthKey);
  const monthDate = dayjs(`${year}-${month}-01`);
  const canvasWidth = width;
  const isShareReady = status === MonthlyRecapDetailStatus.ready;

  useEffect(() => {
    if (status !== MonthlyRecapDetailStatus.needsSelection) {
      return;
    }

    router.replace({
      params: {
        month: monthKey,
      },
      pathname: "/recap/select",
    });
  }, [monthKey, router, status]);

  if (!recap) {
    const fallbackStatus = status === MonthlyRecapDetailStatus.ready ? MonthlyRecapDetailStatus.error : status;

    return (
      <View style={styles.screen}>
        <SafeAreaView edges={["top"]}>
          <AppBar>
            <AppBar.Spacer />
            <AppBar.Menu />
          </AppBar>
        </SafeAreaView>
        <View style={styles.fallbackContainer}>
          <MonthlyRecapTemplateFallback photoCount={photos.length} status={fallbackStatus} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View
        ref={shareCaptureRef}
        collapsable={false}
        renderToHardwareTextureAndroid
        style={styles.templateLayer}
      >
        <MonthlyRecapTemplate
          monthDate={monthDate}
          photos={photos}
          recap={recap}
          width={canvasWidth}
        />
      </View>
      <SafeAreaView edges={["top"]} pointerEvents="box-none" style={styles.overlay}>
        <AppBar pointerEvents="box-none" variant="overlay">
          <AppBar.Spacer />
          <View pointerEvents="box-none" style={styles.appBarActions}>
            <ShareCaptureMenu
              accessibilityLabel="리캡 공유 메뉴 열기"
              captureRef={shareCaptureRef}
              fileName={monthKey}
              isReady={isShareReady}
            />
            <AppBar.Menu />
          </View>
        </AppBar>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  appBarActions: {
    flexDirection: "row",
    gap: 10,
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 20,
  },
  fallbackContainer: {
    flex: 1,
  },
  screen: {
    backgroundColor: appColors.background,
    flex: 1,
  },
  templateLayer: {
    height: "100%",
  },
});
