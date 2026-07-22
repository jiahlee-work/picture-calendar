import type { ReactNode } from "react";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useRouter } from "expo-router";
import { type GestureResponderEvent, Platform, Pressable, StyleSheet, type StyleProp, Text, type TextStyle, View, type ViewProps } from "react-native";

import { SymbolIconButton } from "@/presentation/components/atoms/symbol-icon-button";
import { Menu } from "@/presentation/components/organisms/menu";
import { appColors } from "@/presentation/theme/colors";
import { appSpacing } from "@/presentation/theme/spacing";

type AppRoute = "/" | "/recap" | "/stickers" | "/settings";

type AppBarProps = {
  children: ReactNode;
  pointerEvents?: ViewProps["pointerEvents"];
  variant?: "default" | "overlay";
};

type AppBarTitleProps = {
  accessibilityLabel?: string;
  children: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<TextStyle>;
  variant?: "large" | "medium" | "small";
};

type TextAppBarActionProps = {
  accessibilityLabel: string;
  label: string;
  onPress: () => void;
};

type IconAppBarActionProps = {
  accessibilityLabel: string;
  icon: SymbolViewProps["name"];
  onPress: () => void;
};

type AppBarActionProps = IconAppBarActionProps | TextAppBarActionProps;

type AppBarComponent = {
  (props: AppBarProps): ReactNode;
  Action: (props: AppBarActionProps) => ReactNode;
  Menu: () => ReactNode;
  Spacer: () => ReactNode;
  Title: (props: AppBarTitleProps) => ReactNode;
};

const MENU_ICON: SymbolViewProps["name"] = { ios: "line.3.horizontal", android: "menu" };
const CALENDAR_ICON: SymbolViewProps["name"] = { ios: "calendar", android: "calendar_month" };
const RECAP_ICON: SymbolViewProps["name"] = { ios: "chart.bar", android: "summarize" };
const STICKER_ICON: SymbolViewProps["name"] = { ios: "tag", android: "sell" };
const SETTINGS_ICON: SymbolViewProps["name"] = { ios: "gearshape", android: "settings" };

function AppBarRoot(props: AppBarProps) {
  const { children, pointerEvents, variant = "default" } = props;

  return (
    <View pointerEvents={pointerEvents} style={[styles.root, variant === "overlay" && styles.overlayRoot]}>
      {children}
    </View>
  );
}

function AppBarTitle(props: AppBarTitleProps) {
  const { accessibilityLabel, children, onPress, style, variant = "medium" } = props;
  const variantStyle = TITLE_VARIANT_STYLES[variant];
  const title = (
    <Text style={[styles.title, variantStyle, style]} numberOfLines={1}>
      {children}
    </Text>
  );

  if (!onPress) {
    return <View style={styles.titleSlot}>{title}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.titleSlot, styles.titleButton, pressed && styles.titleButtonPressed]}
      onPress={onPress}
    >
      <View style={styles.titleRow}>
        {title}
        <SymbolView
          colors={[appColors.black]}
          name={{ ios: "chevron.down", android: "arrow_drop_down" }}
          size={Platform.select({ android: 26, default: 16 })}
          tintColor={appColors.black}
          type="monochrome"
          weight="bold"
        />
      </View>
    </Pressable>
  );
}

function AppBarAction(props: AppBarActionProps) {
  const { accessibilityLabel, onPress } = props;

  if ("icon" in props) {
    return <SymbolIconButton accessibilityLabel={accessibilityLabel} icon={props.icon} onPress={onPress} />;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
      onPress={onPress}
    >
      <Text style={styles.actionText}>{props.label}</Text>
    </Pressable>
  );
}

function AppBarMenu() {
  const router = useRouter();

  const handleNavigate = (route: AppRoute) => {
    router.replace(route);
  };

  return (
    <Menu accessibilityLabel="앱 탐색 열기" trigger={{ icon: MENU_ICON }}>
      <Menu.Item icon={CALENDAR_ICON} label="캘린더" onPress={() => handleNavigate("/")} />
      <Menu.Item icon={RECAP_ICON} label="리캡" onPress={() => handleNavigate("/recap")} />
      <Menu.Item icon={STICKER_ICON} label="스티커" onPress={() => handleNavigate("/stickers")} />
      <Menu.Item icon={SETTINGS_ICON} label="설정" onPress={() => handleNavigate("/settings")} />
    </Menu>
  );
}

function AppBarSpacer() {
  return <View pointerEvents="box-none" style={styles.titleSlot} />;
}

export const AppBar = Object.assign(AppBarRoot, {
  Action: AppBarAction,
  Menu: AppBarMenu,
  Spacer: AppBarSpacer,
  Title: AppBarTitle,
}) as AppBarComponent;

const TITLE_VARIANT_STYLES = {
  large: {
    fontSize: 34,
    lineHeight: 40,
  },
  medium: {
    fontSize: 28,
    lineHeight: 34,
  },
  small: {
    fontSize: 24,
    lineHeight: 30,
  },
} as const;

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
    paddingTop: appSpacing.appBarTopPadding,
  },
  overlayRoot: {
    alignItems: "flex-start",
    paddingTop: appSpacing.appBarTopPadding,
  },
  titleSlot: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  titleButton: {
    alignItems: "flex-start",
  },
  titleButtonPressed: {
    opacity: 0.62,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    maxWidth: "100%",
  },
  title: {
    color: appColors.black,
    flexShrink: 1,
    fontWeight: "900",
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: appColors.blackOverlay26,
    borderRadius: 20,
    flexShrink: 0,
    height: 40,
    justifyContent: "center",
    minWidth: 60,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
  },
  actionButtonPressed: {
    backgroundColor: appColors.blackOverlay34,
  },
  actionText: {
    color: appColors.white,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
});
