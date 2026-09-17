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

import type {
  RecapTextMenuButtonProps,
  RecapTextMenuIconName,
} from "@/presentation/components/molecules/recap-text-menu-button.types";
import { appNativeFontFamily } from "@/presentation/theme/app-typography";

const IOS_MENU_ICON_SIZE = 16;
const IOS_TEXT_STYLE_MENU_ICON_SIZE = 12;
const iosMenuIconAssetNames: Record<RecapTextMenuIconName, string> = {
  alignCenter: "PicalAlignCenter",
  alignLeft: "PicalAlignLeft",
  alignRight: "PicalAlignRight",
  bold: "PicalBold",
  italic: "PicalItalic",
  layerBackward: "PicalLayersArrowDown",
  layerForward: "PicalLayersArrowUp",
  underline: "PicalUnderline",
};

export function RecapTextMenuButton(props: RecapTextMenuButtonProps) {
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
                assetName={iosMenuIconAssetNames[action.icon]}
                size={getIosMenuIconSize(action.icon)}
              />
              <Text modifiers={[fontModifier({ family: appNativeFontFamily })]}>
                {action.title}
              </Text>
              {action.selected ? (
                <Image systemName="checkmark" size={14} />
              ) : null}
            </HStack>
          </Button>
        ))}
      </Menu>
    </Host>
  );
}

function getIosMenuIconSize(icon: RecapTextMenuIconName) {
  if (icon === "bold" || icon === "italic" || icon === "underline") {
    return IOS_TEXT_STYLE_MENU_ICON_SIZE;
  }

  return IOS_MENU_ICON_SIZE;
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
