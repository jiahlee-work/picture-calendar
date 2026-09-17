import { Host, RNHostView } from "@expo/ui";
import {
  DropdownMenu,
  DropdownMenuItem,
  Icon,
  Text,
} from "@expo/ui/jetpack-compose";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import type {
  NativeActionMenuAction,
  NativeActionMenuProps,
} from "@/presentation/components/molecules/native-action-menu.types";

const ANDROID_MENU_ICON_SIZE = 16;
const ANDROID_MENU_TEXT_SIZE = 16;
const androidMenuIconSources = {
  aspectRatio: require("@/presentation/assets/reicon-menu-icons/aspect-ratio.xml"),
  download: require("@/presentation/assets/reicon-menu-icons/download.xml"),
  share: require("@/presentation/assets/reicon-menu-icons/share.xml"),
} satisfies Record<NativeActionMenuAction["icon"], number>;

export function NativeActionMenu(props: NativeActionMenuProps) {
  const { accessibilityLabel, actions, children, onPressAction } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Host matchContents>
      <DropdownMenu
        expanded={isExpanded}
        onDismissRequest={() => setIsExpanded(false)}
      >
        <DropdownMenu.Trigger>
          <RNHostView matchContents>
            <View
              accessible
              accessibilityLabel={accessibilityLabel}
              accessibilityRole="button"
              style={styles.trigger}
            >
              {children}
            </View>
          </RNHostView>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              enabled={!action.disabled}
              onClick={() => {
                setIsExpanded(false);
                onPressAction(action.id);
              }}
            >
              <DropdownMenuItem.LeadingIcon>
                <Icon
                  source={androidMenuIconSources[action.icon]}
                  size={ANDROID_MENU_ICON_SIZE}
                />
              </DropdownMenuItem.LeadingIcon>
              <DropdownMenuItem.Text>
                <Text style={styles.menuText}>{action.title}</Text>
              </DropdownMenuItem.Text>
            </DropdownMenuItem>
          ))}
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  menuText: {
    fontSize: ANDROID_MENU_TEXT_SIZE,
  },
  trigger: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
});
