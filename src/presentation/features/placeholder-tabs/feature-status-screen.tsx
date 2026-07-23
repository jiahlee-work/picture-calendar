import { StyleSheet, Text, View } from "react-native";

import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { appSpacing } from "@/presentation/theme/spacing";

type FeatureStatusScreenProps = {
  title: string;
  eyebrow: string;
  body: string;
};

export function FeatureStatusScreen(props: FeatureStatusScreenProps) {
  const { title, eyebrow, body } = props;

  return (
    <AppSafeAreaView>
      <AppBar>
        <AppBar.Title>{title}</AppBar.Title>
      </AppBar>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: appSpacing.screenHorizontalPadding,
    paddingVertical: appSpacing.screenContentTopPadding,
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
