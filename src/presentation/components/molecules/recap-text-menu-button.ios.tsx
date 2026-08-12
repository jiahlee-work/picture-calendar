import { Host } from "@expo/ui";
import {
  Button,
  HStack,
  Image,
  Menu,
  RNHostView,
  Text,
} from "@expo/ui/swift-ui";
import { disabled as disabledModifier } from "@expo/ui/swift-ui/modifiers";
import { StyleSheet, View } from "react-native";

import type {
  RecapTextMenuButtonProps,
  RecapTextMenuIconName,
} from "@/presentation/components/molecules/recap-text-menu-button.types";

const IOS_MENU_ICON_SIZE = 20;
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
                size={IOS_MENU_ICON_SIZE}
              />
              <Text>{action.title}</Text>
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

const styles = StyleSheet.create({
  trigger: {
    alignItems: "center",
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
});
