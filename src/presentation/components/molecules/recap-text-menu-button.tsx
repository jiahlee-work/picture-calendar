import { Icon } from "@expo/ui";
import {
  MenuView,
  type MenuAction,
  type NativeActionEvent,
} from "@expo/ui/community/menu";
import { StyleSheet, View } from "react-native";

import type {
  RecapTextMenuButtonProps,
  RecapTextMenuIconName,
} from "@/presentation/components/molecules/recap-text-menu-button.types";

const androidMenuIcons: Record<RecapTextMenuIconName, MenuAction["image"]> = {
  alignCenter: Icon.select({
    android: import("@/presentation/assets/reicon-menu-icons/align-center.xml"),
    ios: "text.aligncenter",
  }),
  alignLeft: Icon.select({
    android: import("@/presentation/assets/reicon-menu-icons/align-left.xml"),
    ios: "text.alignleft",
  }),
  alignRight: Icon.select({
    android: import("@/presentation/assets/reicon-menu-icons/align-right.xml"),
    ios: "text.alignright",
  }),
  bold: Icon.select({
    android: import("@/presentation/assets/reicon-menu-icons/bold.xml"),
    ios: "bold",
  }),
  italic: Icon.select({
    android: import("@/presentation/assets/reicon-menu-icons/italic.xml"),
    ios: "italic",
  }),
  layerBackward: Icon.select({
    android:
      import("@/presentation/assets/reicon-menu-icons/layers-arrow-down.xml"),
    ios: "square.3.layers.3d.bottom.filled",
  }),
  layerForward: Icon.select({
    android:
      import("@/presentation/assets/reicon-menu-icons/layers-arrow-up.xml"),
    ios: "square.3.layers.3d.top.filled",
  }),
  underline: Icon.select({
    android: import("@/presentation/assets/reicon-menu-icons/underline.xml"),
    ios: "underline",
  }),
};

export function RecapTextMenuButton(props: RecapTextMenuButtonProps) {
  const { accessibilityLabel, actions, children, onPressAction } = props;
  const menuActions = actions.map((action): MenuAction => ({
    attributes: { disabled: action.disabled },
    id: action.id,
    image: androidMenuIcons[action.icon],
    state: action.selected ? "on" : "off",
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
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
});
