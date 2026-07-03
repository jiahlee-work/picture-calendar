import { type SymbolViewProps } from "expo-symbols";

import { Menu } from "@/presentation/components/organisms/menu";

type ShareCaptureSaveMenuItemProps = {
  onPress: () => void;
};

const SAVE_ICON: SymbolViewProps["name"] = { android: "download", ios: "square.and.arrow.down" };

export function ShareCaptureSaveMenuItem(props: ShareCaptureSaveMenuItemProps) {
  const { onPress } = props;

  return <Menu.Item icon={SAVE_ICON} label="이미지 저장" onPress={onPress} />;
}
