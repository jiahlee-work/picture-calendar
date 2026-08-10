import { Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

import {
  ReiconIcon,
  type ReiconName,
} from "@/presentation/components/atoms/reicon-icon";
import { appColors } from "@/presentation/theme/colors";

export type RecapDecoratingToolbarAction = {
  accessibilityLabel: string;
  icon: ReiconName;
  id: "background" | "gallery" | "layout" | "sticker" | "text";
};

export const RECAP_DECORATING_TOOLBAR_ACTIONS: RecapDecoratingToolbarAction[] =
  [
    {
      accessibilityLabel: "레이아웃 선택",
      icon: "Grid10",
      id: "layout",
    },
    {
      accessibilityLabel: "배경색 선택",
      icon: "ColorsSquare",
      id: "background",
    },
    {
      accessibilityLabel: "텍스트 추가",
      icon: "Text",
      id: "text",
    },
    {
      accessibilityLabel: "라이브러리 열기",
      icon: "StickerSmile",
      id: "sticker",
    },
    {
      accessibilityLabel: "리캡 사진 선택",
      icon: "Gallery",
      id: "gallery",
    },
  ];

const RECAP_DECORATING_TOOLBAR_ICON_SIZE = 24;

type RecapDecoratingToolbarProps = {
  onSelectAction: (action: RecapDecoratingToolbarAction) => void;
};

export function RecapDecoratingToolbar(props: RecapDecoratingToolbarProps) {
  const { onSelectAction } = props;

  return (
    <Animated.View
      entering={FadeInDown.duration(180)}
      exiting={FadeOutDown.duration(140)}
      style={styles.toolbar}
    >
      {RECAP_DECORATING_TOOLBAR_ACTIONS.map((action) => (
        <Pressable
          key={action.id}
          accessibilityRole="button"
          accessibilityLabel={action.accessibilityLabel}
          hitSlop={10}
          style={({ pressed }) => [
            styles.toolbarButton,
            pressed && styles.toolbarButtonPressed,
          ]}
          onPress={() => onSelectAction(action)}
        >
          <ReiconIcon
            color={appColors.black}
            name={action.icon}
            size={RECAP_DECORATING_TOOLBAR_ICON_SIZE}
          />
        </Pressable>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.68)",
    borderColor: "rgba(255,255,255,0.82)",
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    height: 52,
    justifyContent: "space-between",
    maxWidth: 268,
    paddingHorizontal: 6,
    shadowColor: appColors.black,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    width: "100%",
  },
  toolbarButton: {
    alignItems: "center",
    borderRadius: 21,
    flex: 1,
    height: 42,
    justifyContent: "center",
  },
  toolbarButtonPressed: {
    opacity: 0.5,
  },
});
