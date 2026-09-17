import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppText as Text } from "@/presentation/components/atoms/app-text";

import { useRecapNotificationSettings } from "@/application/hooks/use-recap-notification-settings";
import { openAppUpdate } from "@/application/services/device/open-app-update";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import { AppSwitch } from "@/presentation/components/atoms/app-switch";
import { PhotoStorageNoticeBanner } from "@/presentation/components/molecules/photo-storage-notice-banner";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { appColors } from "@/presentation/theme/colors";
import { appSpacing } from "@/presentation/theme/spacing";

export function SettingsScreen() {
  const { isEnabled, isLoading, isSupported, setEnabled } =
    useRecapNotificationSettings();
  const isAppUpdateActionVisible = false;

  const handleUpdateAppVersion = () => {
    void openAppUpdate().catch(() => {
      Alert.alert("스토어를 열 수 없어요", "잠시 후 다시 시도해 주세요.");
    });
  };

  return (
    <AppSafeAreaView>
      <AppBar>
        <AppBar.Title variant="large">Settings</AppBar.Title>
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
          {/* TODO: 앱 스토어 출시 후 최신 버전 확인 기능을 연결하고 업데이트 버튼(스토어 딥링크)을 노출한다. */}
          {isAppUpdateActionVisible ? (
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
          ) : null}
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
