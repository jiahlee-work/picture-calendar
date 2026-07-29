import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { NavigationBar } from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import {
  AppBottomNavigationController,
  AppBottomNavigationVisibilityProvider,
} from "@/presentation/providers/app-bottom-navigation-controller";
import { AppRuntimeEffects } from "@/presentation/providers/app-runtime-effects";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <AppRuntimeEffects />
          <AppBottomNavigationVisibilityProvider>
            <View style={styles.content}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen
                  name="index"
                  options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="recap" />
                <Stack.Screen name="recap/select" />
                <Stack.Screen name="recap/[year]/[month]" />
                <Stack.Screen name="stickers" />
                <Stack.Screen name="settings" />
              </Stack>
              <AppBottomNavigationController />
            </View>
          </AppBottomNavigationVisibilityProvider>
          <NavigationBar hidden={false} style="light" />
          <StatusBar hidden={false} style="dark" />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
});
