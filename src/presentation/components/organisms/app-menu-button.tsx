import { useState } from "react";
import { type SymbolViewProps } from "expo-symbols";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeOut, ZoomInEasyDown } from "react-native-reanimated";

import { SymbolIconButton } from "@/presentation/components/atoms/symbol-icon-button";
import { AppMenuItem } from "@/presentation/components/molecules/app-menu-item";
import { appColors } from "@/presentation/theme/colors";

type AppRoute = "/" | "/recap" | "/stickers" | "/profile";
type AppMenuButtonProps = {
  decorationLabel?: string;
  onToggleDecorating?: () => void;
};
type MenuAction = {
  icon: SymbolViewProps["name"];
  label: string;
  onPress: () => void;
};
const menuIcon: SymbolViewProps["name"] = { ios: "line.3.horizontal", android: "menu" };
const decorationIcon: SymbolViewProps["name"] = { ios: "paintpalette", android: "palette" };
const calendarIcon: SymbolViewProps["name"] = { ios: "calendar", android: "calendar_month" };
const recapIcon: SymbolViewProps["name"] = { ios: "chart.bar", android: "summarize" };
const stickerIcon: SymbolViewProps["name"] = { ios: "tag", android: "sell" };
const profileIcon: SymbolViewProps["name"] = { ios: "person.crop.circle", android: "person" };

export function AppMenuButton(props: AppMenuButtonProps) {
  const { decorationLabel = "꾸미기", onToggleDecorating } = props;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const canToggleDecorating = Boolean(onToggleDecorating);

  const handleNavigate = (route: AppRoute) => {
    setIsOpen(false);
    router.push(route);
  };

  const handleToggleDecorating = () => {
    setIsOpen(false);
    onToggleDecorating?.();
  };

  const handleOpen = () => {
    setIsOpen((current) => !current);
  };

  const menuActions: MenuAction[] = [
    ...(canToggleDecorating
      ? [
          {
            icon: decorationIcon,
            label: decorationLabel,
            onPress: handleToggleDecorating,
          },
        ]
      : [
          {
            icon: calendarIcon,
            label: "캘린더",
            onPress: () => handleNavigate("/"),
          },
        ]),
    {
      icon: recapIcon,
      label: "리캡",
      onPress: () => handleNavigate("/recap"),
    },
    {
      icon: stickerIcon,
      label: "스티커",
      onPress: () => handleNavigate("/stickers"),
    },
    {
      icon: profileIcon,
      label: "마이",
      onPress: () => handleNavigate("/profile"),
    },
  ];

  return (
    <View style={styles.root}>
      <SymbolIconButton
        accessibilityLabel="앱 탐색 열기"
        icon={menuIcon}
        isExpanded={isOpen}
        onPress={handleOpen}
      />

      {isOpen && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="앱 탐색 닫기"
            style={styles.dismissOverlay}
            onPress={() => setIsOpen(false)}
          />
          <Animated.View
            entering={ZoomInEasyDown.duration(220).easing(Easing.out(Easing.cubic))}
            exiting={FadeOut.duration(120).easing(Easing.out(Easing.quad))}
            style={styles.panel}
          >
            {menuActions.map((action) => (
              <AppMenuItem key={action.label} icon={action.icon} label={action.label} onPress={action.onPress} />
            ))}
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    zIndex: 10,
  },
  dismissOverlay: {
    backgroundColor: appColors.blackOverlay26,
    bottom: -3000,
    left: -3000,
    position: "absolute",
    right: -3000,
    top: -3000,
    zIndex: 9,
  },
  panel: {
    backgroundColor: appColors.background,
    borderColor: "#eeeeee",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 148,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    top: 46,
    zIndex: 11,
  },
});
