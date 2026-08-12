import { Portal } from "@gorhom/portal";
import {
  createContext,
  use,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeOut,
  ZoomInEasyDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ReiconIcon,
  type ReiconName,
} from "@/presentation/components/atoms/reicon-icon";
import {
  getMenuPanelLayout,
  type MenuAnchorFrame,
  type MenuPanelPlacement,
} from "@/presentation/helpers/controls/menu-panel-layout";
import { APP_OVERLAY_PORTAL_HOST_NAME } from "@/presentation/helpers/overlays/app-portal";
import { appColors } from "@/presentation/theme/colors";

type MenuProps = {
  accessibilityLabel: string;
  children: ReactNode;
  disabled?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  placement?: MenuPanelPlacement;
  trigger: MenuTriggerConfig | ((props: MenuTriggerRenderProps) => ReactNode);
};

type MenuTriggerConfig = {
  icon?: ReiconName;
  label?: string;
  size?: number;
};

type MenuTriggerRenderProps = {
  isOpen: boolean;
  toggle: () => void;
};

type MenuItemProps = {
  disabled?: boolean;
  icon?: ReiconName;
  label: string;
  onPress: () => void;
};

type MenuComponent = {
  (props: MenuProps): ReactNode;
  Item: (props: MenuItemProps) => ReactNode;
  useClose: () => (() => void) | null;
};

const MenuCloseContext = createContext<(() => void) | null>(null);

const MENU_BUTTON_SIZE = 40;

function MenuRoot(props: MenuProps) {
  const {
    accessibilityLabel,
    children,
    disabled = false,
    onOpenChange,
    placement = "bottom",
    trigger,
  } = props;
  const triggerRef = useRef<View>(null);
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const [isOpening, setIsOpening] = useState(false);
  const [anchorFrame, setAnchorFrame] = useState<MenuAnchorFrame | null>(null);
  const isOpen = anchorFrame !== null;
  const panelLayout = anchorFrame
    ? getMenuPanelLayout(
        anchorFrame,
        { height: screenHeight, width: screenWidth },
        insets,
        placement,
      )
    : null;

  const handleToggle = () => {
    if (disabled) {
      return;
    }

    if (isOpen) {
      setAnchorFrame(null);
      onOpenChange?.(false);
      return;
    }

    setIsOpening(true);
  };
  const handleClose = () => {
    setAnchorFrame(null);
    onOpenChange?.(false);
  };

  useLayoutEffect(() => {
    if (!isOpening) {
      return;
    }

    const triggerNode = triggerRef.current;

    if (!triggerNode) {
      setIsOpening(false);
      return;
    }

    triggerNode.measureInWindow((x, y, width, height) => {
      setIsOpening(false);
      setAnchorFrame({ height, width, x, y });
      onOpenChange?.(true);
    });
  }, [isOpening, onOpenChange]);

  return (
    <View style={styles.root}>
      <View ref={triggerRef} collapsable={false}>
        {typeof trigger === "function" ? (
          trigger({ isOpen, toggle: handleToggle })
        ) : (
          <MenuTrigger
            accessibilityLabel={accessibilityLabel}
            disabled={disabled}
            isOpen={isOpen}
            trigger={trigger}
            onPress={handleToggle}
          />
        )}
      </View>

      {isOpen && panelLayout && (
        <Portal hostName={APP_OVERLAY_PORTAL_HOST_NAME}>
          <View pointerEvents="box-none" style={styles.portalRoot}>
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
              style={[styles.panel, panelLayout]}
            >
              <MenuCloseContext value={handleClose}>
                {children}
              </MenuCloseContext>
            </Animated.View>
          </View>
        </Portal>
      )}
    </View>
  );
}

function MenuTrigger({
  accessibilityLabel,
  disabled,
  isOpen,
  onPress,
  trigger,
}: {
  accessibilityLabel: string;
  disabled: boolean;
  isOpen: boolean;
  onPress: () => void;
  trigger: MenuTriggerConfig;
}) {
  const hasIcon = Boolean(trigger.icon);
  const hasLabel = Boolean(trigger.label);
  const size = trigger.size ?? MENU_BUTTON_SIZE;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, expanded: isOpen }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.trigger,
        { borderRadius: size / 2, height: size, minWidth: size },
        hasIcon && !hasLabel && styles.iconOnlyTrigger,
        hasIcon && !hasLabel && { width: size },
        disabled && styles.triggerDisabled,
        pressed && styles.triggerPressed,
      ]}
      onPress={onPress}
    >
      {trigger.icon && (
        <ReiconIcon color={appColors.white} name={trigger.icon} size={24} />
      )}
      {trigger.label && <Text style={styles.triggerText}>{trigger.label}</Text>}
    </Pressable>
  );
}

function MenuItem(props: MenuItemProps) {
  const { disabled = false, icon, label, onPress } = props;
  const closeMenu = useMenuClose();

  const handlePress = () => {
    if (disabled) {
      return;
    }

    onPress();
    closeMenu?.();
  };

  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        disabled && styles.itemDisabled,
        pressed && styles.itemPressed,
      ]}
      onPress={(event) => {
        event.stopPropagation();
        handlePress();
      }}
    >
      {icon && <ReiconIcon color={appColors.black} name={icon} size={20} />}
      <Text style={styles.itemText}>{label}</Text>
    </Pressable>
  );
}

function useMenuClose() {
  return use(MenuCloseContext);
}

export const Menu = Object.assign(MenuRoot, {
  Item: MenuItem,
  useClose: useMenuClose,
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
  triggerDisabled: {
    opacity: 0.38,
  },
  triggerText: {
    color: appColors.white,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  dismissOverlay: {
    backgroundColor: appColors.blackOverlay26,
    ...StyleSheet.absoluteFill,
  },
  panel: {
    backgroundColor: appColors.background,
    borderColor: "#eeeeee",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    position: "absolute",
    zIndex: 1,
  },
  item: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  itemDisabled: {
    opacity: 0.34,
  },
  itemPressed: {
    backgroundColor: "#f4f4f4",
  },
  itemText: {
    color: appColors.black,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  portalRoot: {
    ...StyleSheet.absoluteFill,
    elevation: 100,
    zIndex: 100,
  },
});
