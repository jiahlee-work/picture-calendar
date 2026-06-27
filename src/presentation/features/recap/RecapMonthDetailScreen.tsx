import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppMenuButton } from "@/presentation/components/organisms/app-menu-button";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

type RecapMonthDetailScreenProps = {
  month: string;
  year: string;
};

export function RecapMonthDetailScreen(props: RecapMonthDetailScreenProps) {
  const { month, year } = props;
  const title = dayjs(`${year}-${month}-01`).isValid() ? dayjs(`${year}-${month}-01`).format("MMMM YYYY") : "Monthly Recap";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>이 달의 리캡을 준비하고 있어요.</Text>
        </View>
        <AppMenuButton />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: appColors.background,
    flex: 1,
  },
  appBar: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    color: appColors.black,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
  },
  body: {
    color: "#7b7b7b",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
  },
});
