import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import {
  MonthlyRecapDetailStatus,
  useMonthlyRecapDetail,
} from "@/application/hooks/use-monthly-recap-detail";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import { MonthlyRecapTemplateFallback } from "@/presentation/components/molecules/monthly-recap-template-fallback";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { MonthlyRecapTemplate } from "@/presentation/components/templates/monthly-recap-template";
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
    const fallbackStatus =
      status === MonthlyRecapDetailStatus.ready
        ? MonthlyRecapDetailStatus.error
        : status;

    return (
      <View style={styles.screen}>
        <AppSafeAreaView edges={["top"]} variant="inset">
          <AppBar>
            <AppBar.Spacer />
            <AppBar.Menu />
          </AppBar>
        </AppSafeAreaView>
        <View style={styles.fallbackContainer}>
          <MonthlyRecapTemplateFallback
            photoCount={photos.length}
            status={fallbackStatus}
          />
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
        <AppSafeAreaView
          edges={["top"]}
          pointerEvents="box-none"
          variant="overlay"
        >
          <AppBar pointerEvents="box-none" variant="overlay">
            <AppBar.Spacer />
            <View pointerEvents="box-none" style={styles.appBarActions}>
              <ShareCaptureMenu
                accessibilityLabel="리캡 공유 버튼"
                captureRef={shareCaptureRef}
                fileName={monthKey}
                isReady={isShareReady}
              />
              <AppBar.Menu />
            </View>
          </AppBar>
        </AppSafeAreaView>
      </View>
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
  templateLayer: {
    height: "100%",
  },
});
