import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { useRecapMonthList } from "@/application/hooks/use-recap-month-list";
import {
  RecapMonthStatus,
  type RecapMonthSummary,
} from "@/application/services/recap/recap-month-list";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import { RecapMonthFolder } from "@/presentation/components/molecules/recap-month-folder";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { appSpacing } from "@/presentation/theme/spacing";

const RECAP_MONTH_GRID_COLUMN_GAP = 16;

export function RecapMonthListScreen() {
  const { months } = useRecapMonthList();
  const { width: windowWidth } = useWindowDimensions();
  const router = useRouter();
  const contentWidth = windowWidth - appSpacing.screenHorizontalPadding * 2;
  const monthFolderItemWidth = Math.max(
    0,
    (contentWidth - RECAP_MONTH_GRID_COLUMN_GAP) / 2,
  );

  const handlePressMonth = (month: RecapMonthSummary) => {
    if (
      month.status === RecapMonthStatus.disabledEmpty ||
      month.status === RecapMonthStatus.disabledCollecting
    ) {
      return;
    }

    router.push({
      params: {
        month: month.monthNumber,
        year: String(month.year),
      },
      pathname: "/recap/[year]/[month]",
    });
  };

  return (
    <AppSafeAreaView>
      <AppBar>
        <AppBar.Title variant="large">Recap</AppBar.Title>
      </AppBar>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {months.map((month) => (
            <RecapMonthFolder
              key={month.month}
              folderWidth={monthFolderItemWidth}
              month={month}
              style={{ width: monthFolderItemWidth }}
              onPress={handlePressMonth}
            />
          ))}
        </View>
      </ScrollView>
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: appSpacing.screenContentBottomPadding,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
    paddingTop: appSpacing.screenContentTopPadding,
  },
  grid: {
    columnGap: RECAP_MONTH_GRID_COLUMN_GAP,
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
