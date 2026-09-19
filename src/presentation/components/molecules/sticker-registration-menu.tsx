import { Host, RNHostView } from "@expo/ui";
import {
  DropdownMenu,
  DropdownMenuItem,
  Icon,
  Text,
} from "@expo/ui/jetpack-compose";
import { useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { appNativeFontFamily } from "@/presentation/theme/app-typography";
import { translate } from "@/application/services/localization/app-i18n";

type StickerRegistrationMenuProps = {
  children: ReactNode;
  disabled?: boolean;
  onRegisterFromClipboard: () => void;
  onRegisterFromLibrary: () => void;
};

const ICON_SIZE = 16;
const MENU_TEXT_SIZE = 16;
const stickerRegistrationMenuIcons = {
  clipboard: require("@/presentation/assets/reicon-menu-icons/clipboard.xml"),
  gallery: require("@/presentation/assets/reicon-menu-icons/gallery.xml"),
} as const;

export function StickerRegistrationMenu(props: StickerRegistrationMenuProps) {
  const {
    children,
    disabled = false,
    onRegisterFromClipboard,
    onRegisterFromLibrary,
  } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  if (disabled) {
    return children;
  }

  return (
    <Host matchContents>
      <DropdownMenu
        expanded={isExpanded}
        onDismissRequest={() => setIsExpanded(false)}
      >
        <DropdownMenu.Trigger>
          <RNHostView matchContents>
            <View accessible accessibilityRole="button" style={styles.trigger}>
              {children}
            </View>
          </RNHostView>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          <DropdownMenuItem
            onClick={() => {
              setIsExpanded(false);
              onRegisterFromLibrary();
            }}
          >
            <DropdownMenuItem.LeadingIcon>
              <Icon
                source={stickerRegistrationMenuIcons.gallery}
                size={ICON_SIZE}
              />
            </DropdownMenuItem.LeadingIcon>
            <DropdownMenuItem.Text>
              <Text style={styles.menuText}>
                {translate("stickers.registerFromGallery")}
              </Text>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setIsExpanded(false);
              onRegisterFromClipboard();
            }}
          >
            <DropdownMenuItem.LeadingIcon>
              <Icon
                source={stickerRegistrationMenuIcons.clipboard}
                size={ICON_SIZE}
              />
            </DropdownMenuItem.LeadingIcon>
            <DropdownMenuItem.Text>
              <Text style={styles.menuText}>
                {translate("stickers.registerFromClipboard")}
              </Text>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  menuText: {
    fontFamily: appNativeFontFamily,
    fontSize: MENU_TEXT_SIZE,
  },
  trigger: {
    alignItems: "center",
    justifyContent: "center",
  },
});
