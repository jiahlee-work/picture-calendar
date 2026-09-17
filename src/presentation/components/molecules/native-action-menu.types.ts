import type { ReactNode } from "react";

export type NativeActionMenuIconName = "aspectRatio" | "download" | "share";

export type NativeActionMenuAction = {
  disabled?: boolean;
  icon: NativeActionMenuIconName;
  id: string;
  title: string;
};

export type NativeActionMenuProps = {
  accessibilityLabel: string;
  actions: NativeActionMenuAction[];
  children: ReactNode;
  onPressAction: (actionId: string) => void;
};
