import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRecapMonthList } from "@/application/hooks/use-recap-month-list";
import { RecapMonthFolderCard } from "@/presentation/components/molecules/recap-month-folder-card";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { AppMenuButton } from "@/presentation/components/organisms/app-menu-button";
import { appColors } from "@/presentation/theme/colors";

export function RecapMonthListScreen() {
  const { months } = useRecapMonthList();

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar style={styles.appBar}>
        <AppBar.Title variant="large">Recap</AppBar.Title>
        <AppMenuButton />
      </AppBar>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {months.map((month) => (
            <RecapMonthFolderCard key={month.month} month={month} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: appColors.background,
    flex: 1,
  },
  appBar: {
    paddingTop: 10,
  },
  content: {
    paddingBottom: 36,
    paddingHorizontal: 12,
    paddingTop: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
