import { type Href, useRouter } from "expo-router";
import { useCallback, type ReactNode } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  StyleSheet,
  type StyleProp,
  Text,
  type TextStyle,
  View,
  type ViewProps,
} from "react-native";

import {
  ReiconIcon,
  type ReiconName,
} from "@/presentation/components/atoms/reicon-icon";
import { SymbolIconButton } from "@/presentation/components/atoms/symbol-icon-button";
import { appColors } from "@/presentation/theme/colors";
import { appSpacing } from "@/presentation/theme/spacing";

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
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

type IconAppBarActionProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: ReiconName;
  onPress: () => void;
};

type AppBarActionProps = IconAppBarActionProps | TextAppBarActionProps;

type AppBarBackActionProps = {
  accessibilityLabel?: string;
  disabled?: boolean;
  fallbackHref?: Href;
  onBeforeBack?: () => boolean | void | Promise<boolean | void>;
  onPress?: () => void;
};

type AppBarComponent = {
  (props: AppBarProps): ReactNode;
  Action: (props: AppBarActionProps) => ReactNode;
  BackAction: (props: AppBarBackActionProps) => ReactNode;
  Spacer: () => ReactNode;
  Title: (props: AppBarTitleProps) => ReactNode;
};

function AppBarRoot(props: AppBarProps) {
  const { children, pointerEvents, variant = "default" } = props;

  return (
    <View
      pointerEvents={pointerEvents}
      style={[styles.root, variant === "overlay" && styles.overlayRoot]}
    >
      {children}
    </View>
  );
}

function AppBarTitle(props: AppBarTitleProps) {
  const {
    accessibilityLabel,
    children,
    onPress,
    style,
    variant = "medium",
  } = props;
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
      style={({ pressed }) => [
        styles.titleSlot,
        styles.titleButton,
        pressed && styles.titleButtonPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.titleRow}>
        {title}
        <ReiconIcon color={appColors.black} name="ChevronDown" size={18} />
      </View>
    </Pressable>
  );
}

function AppBarAction(props: AppBarActionProps) {
  const { accessibilityLabel, disabled = false, onPress } = props;

  if ("icon" in props) {
    return (
      <SymbolIconButton
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        icon={props.icon}
        onPress={onPress}
      />
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={disabled ? { disabled: true } : undefined}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        disabled && styles.actionButtonDisabled,
        pressed && styles.actionButtonPressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.actionText}>{props.label}</Text>
    </Pressable>
  );
}

function AppBarBackAction(props: AppBarBackActionProps) {
  const router = useRouter();
  const {
    accessibilityLabel = "뒤로가기",
    disabled = false,
    fallbackHref = "/",
    onBeforeBack,
    onPress,
  } = props;
  const navigateBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  }, [fallbackHref, router]);
  const handlePress = useCallback(async () => {
    if (disabled) {
      return;
    }

    onPress?.();

    if (onBeforeBack) {
      const shouldProceed = await onBeforeBack();

      if (shouldProceed === false) {
        return;
      }
    }

    navigateBack();
  }, [disabled, navigateBack, onBeforeBack, onPress]);

  return (
    <SymbolIconButton
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      icon="ChevronLeft"
      onPress={handlePress}
    />
  );
}

function AppBarSpacer() {
  return <View pointerEvents="box-none" style={styles.titleSlot} />;
}

export const AppBar = Object.assign(AppBarRoot, {
  Action: AppBarAction,
  BackAction: AppBarBackAction,
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
  actionButtonDisabled: {
    opacity: 0.38,
  },
  actionText: {
    color: appColors.white,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
});
