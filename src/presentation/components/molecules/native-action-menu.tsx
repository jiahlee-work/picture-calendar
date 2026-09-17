import { Icon } from "@expo/ui";
import {
  MenuView,
  type MenuAction,
  type NativeActionEvent,
} from "@expo/ui/community/menu";
import { StyleSheet, View } from "react-native";

import type {
  NativeActionMenuAction,
  NativeActionMenuProps,
} from "@/presentation/components/molecules/native-action-menu.types";

const androidMenuIcons: Record<
  NativeActionMenuAction["icon"],
  MenuAction["image"]
> = {
  aspectRatio: Icon.select({
    android: import("@/presentation/assets/reicon-menu-icons/aspect-ratio.xml"),
    ios: "aspectratio",
  }),
  download: Icon.select({
    android: import("@/presentation/assets/reicon-menu-icons/download.xml"),
    ios: "arrow.down.to.line",
  }),
  share: Icon.select({
    android: import("@/presentation/assets/reicon-menu-icons/share.xml"),
    ios: "square.and.arrow.up",
  }),
};

export function NativeActionMenu(props: NativeActionMenuProps) {
  const { accessibilityLabel, actions, children, onPressAction } = props;
  const menuActions = actions.map((action): MenuAction => ({
    attributes: { disabled: action.disabled },
    id: action.id,
    image: androidMenuIcons[action.icon],
    title: action.title,
  }));
  const handlePressAction = (event: NativeActionEvent) => {
    onPressAction(event.nativeEvent.event);
  };

  return (
    <MenuView actions={menuActions} onPressAction={handlePressAction}>
      <View
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={styles.trigger}
      >
        {children}
      </View>
    </MenuView>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
});
