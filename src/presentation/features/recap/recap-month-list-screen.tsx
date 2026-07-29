import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { useRecapMonthList } from "@/application/hooks/use-recap-month-list";
import {
  RecapMonthStatus,
  type RecapMonthSummary,
} from "@/application/services/recap/recap-month-list";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import { RecapMonthFolder } from "@/presentation/components/molecules/recap-month-folder";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { appSpacing } from "@/presentation/theme/spacing";

export function RecapMonthListScreen() {
  const { months } = useRecapMonthList();
  const router = useRouter();

  const handlePressMonth = (month: RecapMonthSummary) => {
    if (month.status === RecapMonthStatus.needsSelection) {
      router.push({
        params: {
          month: month.month,
        },
        pathname: "/recap/select",
      });
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
              month={month}
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
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
