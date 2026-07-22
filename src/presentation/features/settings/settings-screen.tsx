import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { useRecapNotificationSettings } from "@/application/hooks/use-recap-notification-settings";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import { PhotoStorageNoticeBanner } from "@/presentation/components/molecules/photo-storage-notice-banner";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { appColors } from "@/presentation/theme/colors";
import { appSpacing } from "@/presentation/theme/spacing";

type SettingsScreenViewProps = {
  isEnabled: boolean;
  isLoading: boolean;
  isSupported: boolean;
  renderMenu?: () => ReactNode;
  onToggleRecapNotification: (isEnabled: boolean) => void;
  onUpdateAppVersion: () => void;
};

export function SettingsScreen() {
  const { isEnabled, isLoading, isSupported, setEnabled } =
    useRecapNotificationSettings();

  // TODO: 앱 최신 버전 아닐 경우 업데이트
  const handleUpdateAppVer = () => {
    console.log("update app version");
  };

  return (
    <SettingsScreenView
      isEnabled={isEnabled}
      isLoading={isLoading}
      isSupported={isSupported}
      renderMenu={() => <AppBar.Menu />}
      onToggleRecapNotification={setEnabled}
      onUpdateAppVersion={handleUpdateAppVer}
    />
  );
}

export function SettingsScreenView(props: SettingsScreenViewProps) {
  const {
    isEnabled,
    isLoading,
    isSupported,
    renderMenu,
    onToggleRecapNotification,
    onUpdateAppVersion,
  } = props;

  return (
    <AppSafeAreaView>
      <AppBar>
        <AppBar.Title>Settings</AppBar.Title>
        {renderMenu?.()}
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
            <Switch
              accessibilityLabel="리캡 알림"
              disabled={isLoading || !isSupported}
              trackColor={{ false: "#D7DADF", true: "#F05BCF" }}
              thumbColor={isEnabled ? appColors.black : appColors.white}
              value={isEnabled}
              onValueChange={onToggleRecapNotification}
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
              onPress={onUpdateAppVersion}
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
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: appColors.blackOverlay26,
  },
  settingCopy: {
    flex: 1,
    gap: 2,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: appColors.black,
    borderRadius: 20,
  },
  updateLabel: {
    color: appColors.white,
  },
});
