import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useRecapNotificationSettings } from "@/application/hooks/use-recap-notification-settings";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import { AppSwitch } from "@/presentation/components/atoms/app-switch";
import { PhotoStorageNoticeBanner } from "@/presentation/components/molecules/photo-storage-notice-banner";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { appColors } from "@/presentation/theme/colors";
import { appSpacing } from "@/presentation/theme/spacing";

export function SettingsScreen() {
  const { isEnabled, isLoading, isSupported, setEnabled } =
    useRecapNotificationSettings();

  const handleUpdateAppVersion = () => {
    console.log("update app version");
  };

  return (
    <AppSafeAreaView>
      <AppBar>
        <AppBar.Title>Settings</AppBar.Title>
      </AppBar>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PhotoStorageNoticeBanner />
        <View>
          <Text style={styles.sectionTitle}>설정</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>리캡</Text>
              <Text style={styles.settingSubtitle}>
                리캡 업데이트 정보를 알려드려요
              </Text>
            </View>
            <AppSwitch
              accessibilityLabel="리캡 알림"
              disabled={isLoading || !isSupported}
              value={isEnabled}
              onValueChange={setEnabled}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>앱 버전</Text>
              <Text style={styles.settingSubtitle}>최신 버전</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="업데이트"
              style={styles.update}
              onPress={handleUpdateAppVersion}
            >
              <Text style={styles.updateLabel}>업데이트</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingBottom: appSpacing.screenContentBottomPadding,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
    paddingTop: appSpacing.screenContentTopPadding,
  },
  sectionTitle: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22,
    marginBottom: 12,
  },
  settingCopy: {
    flex: 1,
    gap: 2,
  },
  settingItem: {
    alignItems: "center",
    borderBottomColor: appColors.blackOverlay26,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  settingSubtitle: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 27,
  },
  settingTitle: {
    color: appColors.black,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 34,
  },
  update: {
    backgroundColor: appColors.black,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  updateLabel: {
    color: appColors.white,
  },
});
