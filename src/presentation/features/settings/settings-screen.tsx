import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar } from "@/presentation/components/organisms/app-bar";
import { PhotoStorageNoticeBanner } from "@/presentation/components/molecules/photo-storage-notice-banner";
import { appColors } from "@/presentation/theme/colors";

export function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar>
        <AppBar.Title>Settings</AppBar.Title>
        <AppBar.Menu />
      </AppBar>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PhotoStorageNoticeBanner />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: appColors.background,
    flex: 1,
  },
  content: {
    paddingBottom: 36,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
});
