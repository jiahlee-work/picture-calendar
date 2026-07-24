import { ScrollView, StyleSheet, View } from "react-native";

import { useRecapMonthList } from "@/application/hooks/use-recap-month-list";
import type { RecapMonthSummary } from "@/application/services/recap/recap-month-list";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import {
  RecapMonthFolder,
  RecapMonthFolderView,
} from "@/presentation/components/molecules/recap-month-folder";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { appSpacing } from "@/presentation/theme/spacing";

type RecapMonthListScreenViewProps = {
  months: RecapMonthSummary[];
  onPressMonth?: (month: RecapMonthSummary) => void;
};

export function RecapMonthListScreen() {
  const { months } = useRecapMonthList();

  return <RecapMonthListScreenView months={months} />;
}

export function RecapMonthListScreenView(props: RecapMonthListScreenViewProps) {
  const { months, onPressMonth } = props;

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
          {months.map((month) =>
            onPressMonth ? (
              <RecapMonthFolderView
                key={month.month}
                month={month}
                onPress={onPressMonth}
              />
            ) : (
              <RecapMonthFolder key={month.month} month={month} />
            ),
          )}
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
