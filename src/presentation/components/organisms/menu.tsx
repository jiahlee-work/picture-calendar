import { createContext, use, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeOut,
  ZoomInEasyDown,
} from "react-native-reanimated";

import {
  ReiconIcon,
  type ReiconName,
} from "@/presentation/components/atoms/reicon-icon";
import { appColors } from "@/presentation/theme/colors";

type MenuProps = {
  accessibilityLabel: string;
  children: ReactNode;
  trigger: MenuTriggerConfig | ((props: MenuTriggerRenderProps) => ReactNode);
};

type MenuTriggerConfig = {
  icon?: ReiconName;
  label?: string;
};

type MenuTriggerRenderProps = {
  isOpen: boolean;
  toggle: () => void;
};

type MenuItemProps = {
  icon?: ReiconName;
  label: string;
  onPress: () => void;
};

type MenuComponent = {
  (props: MenuProps): ReactNode;
  Item: (props: MenuItemProps) => ReactNode;
};

const MenuCloseContext = createContext<(() => void) | null>(null);

const MENU_BUTTON_SIZE = 40;
const MENU_PANEL_GAP = 8;
const MENU_PANEL_TOP = MENU_BUTTON_SIZE + MENU_PANEL_GAP;

function MenuRoot(props: MenuProps) {
  const { accessibilityLabel, children, trigger } = props;
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((current) => !current);
  };
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <View style={styles.root}>
      {typeof trigger === "function" ? (
        trigger({ isOpen, toggle: handleToggle })
      ) : (
        <MenuTrigger
          accessibilityLabel={accessibilityLabel}
          isOpen={isOpen}
          trigger={trigger}
          onPress={handleToggle}
        />
      )}

      {isOpen && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="메뉴 닫기"
            style={styles.dismissOverlay}
            onPress={handleClose}
          />
          <Animated.View
            entering={ZoomInEasyDown.duration(220).easing(
              Easing.out(Easing.cubic),
            )}
            exiting={FadeOut.duration(120).easing(Easing.out(Easing.quad))}
            style={styles.panel}
          >
            <MenuCloseContext value={handleClose}>{children}</MenuCloseContext>
          </Animated.View>
        </>
      )}
    </View>
  );
}

function MenuTrigger({
  accessibilityLabel,
  isOpen,
  onPress,
  trigger,
}: {
  accessibilityLabel: string;
  isOpen: boolean;
  onPress: () => void;
  trigger: MenuTriggerConfig;
}) {
  const hasIcon = Boolean(trigger.icon);
  const hasLabel = Boolean(trigger.label);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ expanded: isOpen }}
      style={({ pressed }) => [
        styles.trigger,
        hasIcon && !hasLabel && styles.iconOnlyTrigger,
        pressed && styles.triggerPressed,
      ]}
      onPress={onPress}
    >
      {trigger.icon ? (
        <ReiconIcon
          color={appColors.white}
          name={trigger.icon}
          size={24}
          weight="Filled"
        />
      ) : null}
      {trigger.label ? (
        <Text style={styles.triggerText}>{trigger.label}</Text>
      ) : null}
    </Pressable>
  );
}

function MenuItem(props: MenuItemProps) {
  const { icon, label, onPress } = props;
  const closeMenu = use(MenuCloseContext);

  const handlePress = () => {
    closeMenu?.();
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="menuitem"
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      onPress={handlePress}
    >
      {icon ? (
        <ReiconIcon
          color={appColors.black}
          name={icon}
          size={20}
          weight="Outline"
        />
      ) : null}
      <Text style={styles.itemText}>{label}</Text>
    </Pressable>
  );
}

export const Menu = Object.assign(MenuRoot, {
  Item: MenuItem,
}) as MenuComponent;

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
    position: "relative",
    zIndex: 10,
  },
  trigger: {
    alignItems: "center",
    backgroundColor: appColors.blackOverlay26,
    borderRadius: 20,
    flexDirection: "row",
    flexShrink: 0,
    gap: 8,
    height: MENU_BUTTON_SIZE,
    justifyContent: "center",
    minWidth: MENU_BUTTON_SIZE,
    paddingHorizontal: 14,
  },
  iconOnlyTrigger: {
    paddingHorizontal: 0,
    width: MENU_BUTTON_SIZE,
  },
  triggerPressed: {
    backgroundColor: appColors.blackOverlay34,
  },
  triggerText: {
    color: appColors.white,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
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
    top: MENU_PANEL_TOP,
    zIndex: 11,
  },
  item: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  itemPressed: {
    backgroundColor: "#f4f4f4",
  },
  itemText: {
    color: appColors.black,
    fontSize: 15,
    fontWeight: "800",
  },
});
