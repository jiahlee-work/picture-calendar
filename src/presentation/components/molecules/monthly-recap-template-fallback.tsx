import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import {
  getMonthlyRecapStatusLabel,
  type MonthlyRecapStatusLabelStatus,
} from "@/application/services/recap/monthly-recap-template-layout";
import { MonthlyRecapDetailStatus } from "@/application/services/recap/monthly-recap-detail";
import { appColors } from "@/presentation/theme/colors";
import type { MonthlyRecap } from "@/shared/recap/types";

type MonthlyRecapTemplateFallbackProps = {
  photoCount?: number;
  status: MonthlyRecapStatusLabelStatus;
  templateId?: MonthlyRecap["templateId"] | null;
};

export function MonthlyRecapTemplateFallback(props: MonthlyRecapTemplateFallbackProps) {
  const { photoCount = 0, status, templateId = null } = props;

  if (status === MonthlyRecapDetailStatus.loading) {
    return (
      <View style={styles.statusPanel}>
        <ActivityIndicator color={appColors.black} />
      </View>
    );
  }

  return (
    <View style={styles.statusPanel}>
      <Text style={styles.statusText}>
        {getMonthlyRecapStatusLabel({ photoCount, status, templateId })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusPanel: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  statusText: {
    color: "#7b7b7b",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 22,
    textAlign: "center",
  },
});
