import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRecapMonthList } from "@/application/hooks/useRecapMonthList";
import { RecapMonthFolderCard } from "@/presentation/components/molecules/recap-month-folder-card";
import { RecapYearSelector } from "@/presentation/components/molecules/recap-year-selector";
import { AppMenuButton } from "@/presentation/components/organisms/app-menu-button";
import { appColors } from "@/presentation/theme/colors";

export function RecapMonthListScreen() {
  const { months, selectYear, selectedYear, yearOptions } = useRecapMonthList();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <View>
          <Text style={styles.title}>Recap</Text>
          <RecapYearSelector options={yearOptions} selectedYear={selectedYear} onSelectYear={selectYear} />
        </View>
        <AppMenuButton />
      </View>

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
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 76,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    color: appColors.black,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40,
    marginBottom: 8,
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
