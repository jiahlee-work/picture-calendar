import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppText as Text } from "@/presentation/components/atoms/app-text";

import { useRecapNotificationSettings } from "@/application/hooks/use-recap-notification-settings";
import { openAppUpdate } from "@/application/services/device/open-app-update";
import { translate } from "@/application/services/localization/app-i18n";
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
      Alert.alert(
        translate("settings.storeErrorTitle"),
        translate("settings.storeErrorMessage"),
      );
    });
  };

  return (
    <AppSafeAreaView>
      <AppBar>
        <AppBar.Title variant="large">
          {translate("screen.settings")}
        </AppBar.Title>
      </AppBar>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PhotoStorageNoticeBanner />
        <View>
          <Text style={styles.sectionTitle}>
            {translate("settings.sectionTitle")}
          </Text>
          <View style={styles.settingItem}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>
                {translate("settings.recap")}
              </Text>
              <Text style={styles.settingSubtitle}>
                {translate("settings.recapDescription")}
              </Text>
            </View>
            <AppSwitch
              accessibilityLabel={translate("settings.recapNotification")}
              disabled={isLoading || !isSupported}
              value={isEnabled}
              onValueChange={setEnabled}
            />
          </View>
          {/* TODO: 앱 스토어 출시 후 최신 버전 확인 기능을 연결하고 업데이트 버튼(스토어 딥링크)을 노출한다. */}
          {isAppUpdateActionVisible ? (
            <View style={styles.settingItem}>
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>
                  {translate("settings.appVersion")}
                </Text>
                <Text style={styles.settingSubtitle}>
                  {translate("settings.latestVersion")}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={translate("common.update")}
                style={styles.update}
                onPress={handleUpdateAppVersion}
              >
                <Text style={styles.updateLabel}>
                  {translate("common.update")}
                </Text>
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
