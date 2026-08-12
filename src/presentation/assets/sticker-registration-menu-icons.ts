import { Icon } from "@expo/ui";

export const stickerRegistrationMenuIcons = {
  clipboard: Icon.select({
    android: import("@/presentation/assets/reicon-menu-icons/clipboard.xml"),
    ios: "clipboard",
  }),
  gallery: Icon.select({
    android: import("@/presentation/assets/reicon-menu-icons/gallery.xml"),
    ios: "photo.on.rectangle",
  }),
} as const;
