import type { ReactNode } from "react";

export type RecapTextMenuIconName =
  | "alignCenter"
  | "alignLeft"
  | "alignRight"
  | "bold"
  | "italic"
  | "layerBackward"
  | "layerForward"
  | "underline";

export type RecapTextMenuAction = {
  disabled?: boolean;
  icon: RecapTextMenuIconName;
  id: string;
  selected?: boolean;
  title: string;
};

export type RecapTextMenuButtonProps = {
  accessibilityLabel: string;
  actions: RecapTextMenuAction[];
  children: ReactNode;
  onPressAction: (actionId: string) => void;
};
