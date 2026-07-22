import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useEffect } from "react";
import { NavigationBar } from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StatusBar as NativeStatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { useRecapNotificationScheduler } from "@/application/hooks/use-recap-notification-scheduler";
import { useRecapNotificationDeepLinking } from "@/presentation/features/notifications/use-recap-notification-deep-linking";
import { appColors } from "@/presentation/theme/colors";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  useRecapNotificationScheduler();
  useRecapNotificationDeepLinking();

  useEffect(() => {
    if (process.env.EXPO_OS !== "android") {
      return;
    }

    NativeStatusBar.setHidden(false);
    NativeStatusBar.setBarStyle("dark-content");
    NativeStatusBar.setBackgroundColor(appColors.background);
    NativeStatusBar.setTranslucent(false);
    NavigationBar.setHidden(false);
    NavigationBar.setStyle("light");
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ gestureEnabled: false }} />
            <Stack.Screen name="recap" />
            <Stack.Screen name="recap/select" />
            <Stack.Screen name="recap/[year]/[month]" />
            <Stack.Screen name="stickers" />
            <Stack.Screen name="settings" />
          </Stack>
          <NavigationBar hidden={false} style="light" />
          <StatusBar hidden={false} style="dark" />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
