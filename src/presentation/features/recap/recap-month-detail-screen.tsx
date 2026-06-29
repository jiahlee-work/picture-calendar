import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MonthlyRecapDetailStatus, useMonthlyRecapDetail } from "@/application/hooks/use-monthly-recap-detail";
import { MonthlyRecapStatusPanel } from "@/presentation/components/molecules/monthly-recap-status-panel";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { MonthlyRecapTemplate } from "@/presentation/components/organisms/monthly-recap-template";
import { ShareCaptureMenu } from "@/presentation/components/organisms/share-capture-menu";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

const ABSOLUTE_FILL_OBJECT = {
  bottom: 0,
  left: 0,
  position: "absolute",
  right: 0,
  top: 0,
} as const;
const RECAP_SHARE_WIDTH = 1080;
const RECAP_SHARE_HEIGHT = 1920;

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
  const isShareReady = status === MonthlyRecapDetailStatus.ready && Boolean(recap);

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

  return (
    <View style={styles.screen}>
      <View style={styles.templateLayer}>
        {status === MonthlyRecapDetailStatus.ready && recap ? (
          <MonthlyRecapTemplate monthDate={monthDate} photos={photos} recap={recap} width={canvasWidth} />
        ) : (
          <MonthlyRecapStatusPanel status={status} />
        )}
      </View>
      <SafeAreaView edges={["top"]} pointerEvents="box-none" style={styles.overlay}>
        <AppBar pointerEvents="box-none" variant="overlay">
          <AppBar.Spacer />
          <View pointerEvents="box-none" style={styles.appBarActions}>
            <ShareCaptureMenu
              accessibilityLabel="리캡 공유 메뉴 열기"
              captureHeight={RECAP_SHARE_HEIGHT}
              captureRef={shareCaptureRef}
              captureWidth={RECAP_SHARE_WIDTH}
              fileName={monthKey}
              isReady={isShareReady}
            />
            <AppBar.Menu />
          </View>
        </AppBar>
      </SafeAreaView>
      {isShareReady && recap ? (
        <View
          ref={shareCaptureRef}
          collapsable={false}
          pointerEvents="none"
          renderToHardwareTextureAndroid
          style={styles.shareCaptureCanvas}
        >
          <MonthlyRecapTemplate
            monthDate={monthDate}
            photos={photos}
            recap={recap}
            width={RECAP_SHARE_WIDTH}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  appBarActions: {
    flexDirection: "row",
    gap: 10,
  },
  overlay: {
    ...ABSOLUTE_FILL_OBJECT,
    zIndex: 20,
  },
  screen: {
    backgroundColor: appColors.background,
    flex: 1,
  },
  shareCaptureCanvas: {
    height: RECAP_SHARE_HEIGHT,
    left: 0,
    position: "absolute",
    top: 0,
    transform: [{ translateX: -(RECAP_SHARE_WIDTH + 120) }],
    width: RECAP_SHARE_WIDTH,
  },
  templateLayer: {
    ...ABSOLUTE_FILL_OBJECT,
  },
});
