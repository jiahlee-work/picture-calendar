import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppText as Text } from "@/presentation/components/atoms/app-text";

import { translate } from "@/application/services/localization/app-i18n";

export function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>{translate("notFound.title")}</Text>
        <Link href="/" style={styles.link}>
          {translate("notFound.action")}
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#fff8f2",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  link: {
    color: "#ff7b54",
    fontSize: 15,
    fontWeight: "700",
  },
  title: {
    color: "#2c2420",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },
});
