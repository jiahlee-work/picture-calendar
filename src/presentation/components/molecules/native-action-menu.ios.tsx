import { Host } from "@expo/ui";
import {
  Button,
  HStack,
  Image,
  Menu,
  RNHostView,
  Text,
} from "@expo/ui/swift-ui";
import {
  disabled as disabledModifier,
  font as fontModifier,
} from "@expo/ui/swift-ui/modifiers";
import { StyleSheet, View } from "react-native";
import type { SFSymbol } from "sf-symbols-typescript";

import type {
  NativeActionMenuAction,
  NativeActionMenuProps,
} from "@/presentation/components/molecules/native-action-menu.types";
import { appNativeFontFamily } from "@/presentation/theme/app-typography";

const IOS_MENU_ICON_SIZE = 16;
const IOS_MENU_TEXT_SIZE = 16;
const iosMenuIconNames: Record<NativeActionMenuAction["icon"], SFSymbol> = {
  aspectRatio: "aspectratio",
  download: "arrow.down.to.line",
  share: "square.and.arrow.up",
};

export function NativeActionMenu(props: NativeActionMenuProps) {
  const { accessibilityLabel, actions, children, onPressAction } = props;
  const trigger = (
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
  );

  return (
    <Host ignoreSafeArea="all" matchContents>
      <Menu label={trigger}>
        {actions.map((action) => (
          <Button
            key={action.id}
            modifiers={action.disabled ? [disabledModifier(true)] : undefined}
            onPress={() => onPressAction(action.id)}
          >
            <HStack spacing={8}>
              <Image
                systemName={iosMenuIconNames[action.icon]}
                size={IOS_MENU_ICON_SIZE}
              />
              <Text
                modifiers={[
                  fontModifier({
                    family: appNativeFontFamily,
                    size: IOS_MENU_TEXT_SIZE,
                  }),
                ]}
              >
                {action.title}
              </Text>
            </HStack>
          </Button>
        ))}
      </Menu>
    </Host>
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
