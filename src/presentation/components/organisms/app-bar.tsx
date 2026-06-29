import type { ReactNode } from "react";
import { SymbolView } from "expo-symbols";
import { type GestureResponderEvent, Platform, Pressable, StyleSheet, type StyleProp, Text, type TextStyle, View, type ViewProps, type ViewStyle } from "react-native";

import { appColors } from "@/presentation/theme/colors";

type AppBarProps = {
  action?: ReactNode;
  children: ReactNode;
  pointerEvents?: ViewProps["pointerEvents"];
  style?: StyleProp<ViewStyle>;
};

type AppBarTitleProps = {
  accessibilityLabel?: string;
  children: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<TextStyle>;
  variant?: "large" | "medium" | "small";
};

type AppBarActionProps = {
  accessibilityLabel: string;
  label: string;
  onPress: () => void;
};

type AppBarComponent = {
  (props: AppBarProps): ReactNode;
  Action: (props: AppBarActionProps) => ReactNode;
  Spacer: () => ReactNode;
  Title: (props: AppBarTitleProps) => ReactNode;
};

function AppBarRoot(props: AppBarProps) {
  const { action, children, pointerEvents, style } = props;

  return (
    <View pointerEvents={pointerEvents} style={[styles.root, style]}>
      {children}
      {action}
    </View>
  );
}

function AppBarTitle(props: AppBarTitleProps) {
  const { accessibilityLabel, children, onPress, style, variant = "medium" } = props;
  const variantStyle = titleVariantStyles[variant];
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
  const { accessibilityLabel, label, onPress } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
      onPress={onPress}
    >
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

function AppBarSpacer() {
  return <View pointerEvents="box-none" style={styles.titleSlot} />;
}

export const AppBar = Object.assign(AppBarRoot, {
  Action: AppBarAction,
  Spacer: AppBarSpacer,
  Title: AppBarTitle,
}) as AppBarComponent;

const titleVariantStyles = {
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
    gap: 12,
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: 20,
  },
  titleSlot: {
    flex: 1,
    minWidth: 0,
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
    height: 40,
    justifyContent: "center",
    minWidth: 60,
    paddingHorizontal: 14,
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
