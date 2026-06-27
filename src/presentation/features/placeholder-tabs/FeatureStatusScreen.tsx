import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppMenuButton } from "@/presentation/components/organisms/app-menu-button";
import { appColors } from "@/presentation/theme/colors";

type FeatureStatusScreenProps = {
  title: string;
  eyebrow: string;
  body: string;
};

export function FeatureStatusScreen(props: FeatureStatusScreenProps) {
  const { title, eyebrow, body } = props;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <Text style={styles.appTitle}>{title}</Text>
        <AppMenuButton />
      </View>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  appBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  appTitle: {
    color: appColors.black,
    fontSize: 28,
    fontWeight: "900",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  eyebrow: {
    color: "#666666",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
  },
  body: {
    color: "#555555",
    fontSize: 15,
    lineHeight: 22,
  },
});
