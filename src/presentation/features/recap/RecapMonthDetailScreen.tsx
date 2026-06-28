import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMonthlyRecapDetail } from "@/application/hooks/useMonthlyRecapDetail";
import { AppMenuButton } from "@/presentation/components/organisms/app-menu-button";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

type RecapMonthDetailScreenProps = {
  month: string;
  year: string;
};

export function RecapMonthDetailScreen(props: RecapMonthDetailScreenProps) {
  const { month, year } = props;
  const router = useRouter();
  const monthKey = `${year}-${month}`;
  const { photos, recap, status } = useMonthlyRecapDetail(monthKey);
  const title = dayjs(`${year}-${month}-01`).isValid() ? dayjs(`${year}-${month}-01`).format("MMMM YYYY") : "Monthly Recap";

  useEffect(() => {
    if (status !== "needs_selection") {
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{toStatusLabel(status, photos.length, recap?.templateId ?? null)}</Text>
        </View>
        <AppMenuButton />
      </View>
    </SafeAreaView>
  );
}

function toStatusLabel(status: string, photoCount: number, templateId: string | null): string {
  if (status === "loading") {
    return "이 달의 리캡을 불러오는 중이에요.";
  }

  if (status === "error") {
    return "이 달의 리캡을 불러오지 못했습니다.";
  }

  if (status === "empty") {
    return "이 달에는 리캡에 사용할 사진이 없어요.";
  }

  if (status === "needs_selection") {
    return "대표 사진 선택 화면으로 이동 중이에요.";
  }

  return `${photoCount}장의 사진으로 ${templateId === "message" ? "메시지" : "캘린더"} 리캡을 준비했어요.`;
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
