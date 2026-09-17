import { Host } from "@expo/ui";
import {
  Button,
  HStack,
  Image,
  Menu,
  RNHostView,
  Text,
} from "@expo/ui/swift-ui";
import { font as fontModifier, scaleEffect } from "@expo/ui/swift-ui/modifiers";
import type { ReactNode } from "react";

import { appNativeFontFamily } from "@/presentation/theme/app-typography";

type StickerRegistrationMenuProps = {
  children: ReactNode;
  disabled?: boolean;
  onRegisterFromClipboard: () => void;
  onRegisterFromLibrary: () => void;
};

const ICON_SIZE = 16;
const MENU_TEXT_SIZE = 16;
const ASSET_ICON_VIEWBOX_SIZE = 24;

export function StickerRegistrationMenu(props: StickerRegistrationMenuProps) {
  const {
    children,
    disabled = false,
    onRegisterFromClipboard,
    onRegisterFromLibrary,
  } = props;

  if (disabled) {
    return children;
  }

  const trigger = (
    <RNHostView matchContents>
      <>{children}</>
    </RNHostView>
  );

  return (
    <Host ignoreSafeArea="all" matchContents>
      <Menu label={trigger}>
        <Button onPress={onRegisterFromClipboard}>
          <HStack spacing={8}>
            <Image
              assetName="PicalClipboard"
              modifiers={[scaleEffect(ICON_SIZE / ASSET_ICON_VIEWBOX_SIZE)]}
            />
            <Text
              modifiers={[
                fontModifier({
                  family: appNativeFontFamily,
                  size: MENU_TEXT_SIZE,
                }),
              ]}
            >
              클립보드 붙여넣기
            </Text>
          </HStack>
        </Button>
        <Button onPress={onRegisterFromLibrary}>
          <HStack spacing={8}>
            <Image
              assetName="PicalGallery"
              modifiers={[scaleEffect(ICON_SIZE / ASSET_ICON_VIEWBOX_SIZE)]}
            />
            <Text
              modifiers={[
                fontModifier({
                  family: appNativeFontFamily,
                  size: MENU_TEXT_SIZE,
                }),
              ]}
            >
              갤러리에서 등록
            </Text>
          </HStack>
        </Button>
      </Menu>
    </Host>
  );
}
