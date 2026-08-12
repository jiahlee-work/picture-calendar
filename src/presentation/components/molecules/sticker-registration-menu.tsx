import {
  MenuView,
  type MenuAction,
  type NativeActionEvent,
} from "@expo/ui/community/menu";
import { type ReactNode } from "react";

import { stickerRegistrationMenuIcons } from "@/presentation/assets/sticker-registration-menu-icons";
import { orderNativeMenuActions } from "@/presentation/helpers/controls/native-menu-actions";

type StickerRegistrationMenuProps = {
  children: ReactNode;
  disabled?: boolean;
  onRegisterFromClipboard: () => void;
  onRegisterFromLibrary: () => void;
};

const STICKER_REGISTRATION_ACTIONS = orderNativeMenuActions([
  {
    id: "library",
    image: stickerRegistrationMenuIcons.gallery,
    title: "갤러리에서 등록",
  },
  {
    id: "clipboard",
    image: stickerRegistrationMenuIcons.clipboard,
    title: "클립보드 붙여넣기",
  },
] satisfies MenuAction[]);

export function StickerRegistrationMenu(props: StickerRegistrationMenuProps) {
  const {
    children,
    disabled = false,
    onRegisterFromClipboard,
    onRegisterFromLibrary,
  } = props;
  const handlePressAction = (event: NativeActionEvent) => {
    if (event.nativeEvent.event === "library") {
      onRegisterFromLibrary();
      return;
    }

    if (event.nativeEvent.event === "clipboard") {
      onRegisterFromClipboard();
    }
  };

  if (disabled) {
    return children;
  }

  return (
    <MenuView
      actions={STICKER_REGISTRATION_ACTIONS}
      onPressAction={handlePressAction}
    >
      {children}
    </MenuView>
  );
}
