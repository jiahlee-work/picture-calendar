import { useEffect } from "react";
import { NavigationBar } from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StatusBar as NativeStatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  useEffect(() => {
    if (process.env.EXPO_OS !== "android") {
      return;
    }

    NativeStatusBar.setHidden(false);
    NativeStatusBar.setBarStyle("dark-content");
    NativeStatusBar.setBackgroundColor("#ffffff");
    NativeStatusBar.setTranslucent(false);
    NavigationBar.setHidden(false);
    NavigationBar.setStyle("light");
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="recap" />
        <Stack.Screen name="stickers" />
        <Stack.Screen name="profile" />
      </Stack>
      <NavigationBar hidden={false} style="light" />
      <StatusBar hidden={false} style="dark" />
    </SafeAreaProvider>
  );
}
