import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>화면을 찾을 수 없어요.</Text>
        <Link href="/" style={styles.link}>
          캘린더로 돌아가기
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
  title: {
    color: "#2c2420",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },
  link: {
    color: "#ff7b54",
    fontSize: 15,
    fontWeight: "700",
  },
});
