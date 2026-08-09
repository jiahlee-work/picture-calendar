import { type ReactNode } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  MenuView,
  type MenuAction,
  type NativeActionEvent,
} from "@expo/ui/community/menu";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
import { TextFormatIcon } from "@/presentation/components/atoms/text-format-icon";
import { TextStyleIcon } from "@/presentation/components/atoms/text-style-icon";
import { appColors } from "@/presentation/theme/colors";
import type { RecapCanvasTextElement } from "@/shared/recap/types";

type RecapTextToolbarProps = {
  textElement: RecapCanvasTextElement;
  onDelete: () => void;
  onOpenColorPicker: () => void;
  onOpenTypographyPicker: () => void;
  onUpdateTextStyle: (update: RecapTextStyleUpdate) => void;
};

export type RecapTextStyleUpdate = Partial<
  Pick<
    RecapCanvasTextElement,
    "fontStyle" | "fontWeight" | "textAlign" | "textDecorationLine"
  >
>;

type StyleAction = {
  accessibilityLabel: string;
  id: "bold" | "italic" | "underline";
  image: MenuAction["image"];
  title: string;
  isSelected: (textElement: RecapCanvasTextElement) => boolean;
  resolveUpdate: (textElement: RecapCanvasTextElement) => RecapTextStyleUpdate;
};

type AlignAction = {
  accessibilityLabel: string;
  id: "center" | "left" | "right";
  title: string;
  isSelected: (textElement: RecapCanvasTextElement) => boolean;
  resolveUpdate: () => RecapTextStyleUpdate;
};

const STYLE_ACTIONS: StyleAction[] = [
  {
    accessibilityLabel: "텍스트 굵게",
    id: "bold",
    image: "bold",
    title: "굵게",
    isSelected: (textElement) => textElement.fontWeight === "bold",
    resolveUpdate: (textElement) => ({
      fontWeight: textElement.fontWeight === "bold" ? "normal" : "bold",
    }),
  },
  {
    accessibilityLabel: "텍스트 기울임",
    id: "italic",
    image: "italic",
    title: "기울임",
    isSelected: (textElement) => textElement.fontStyle === "italic",
    resolveUpdate: (textElement) => ({
      fontStyle: textElement.fontStyle === "italic" ? "normal" : "italic",
    }),
  },
  {
    accessibilityLabel: "텍스트 밑줄",
    id: "underline",
    image: "underline",
    title: "밑줄",
    isSelected: (textElement) => textElement.textDecorationLine === "underline",
    resolveUpdate: (textElement) => ({
      textDecorationLine:
        textElement.textDecorationLine === "underline" ? "none" : "underline",
    }),
  },
];

const TEXT_TOOLBAR_WIDTH = 320;
const TEXT_TOOLBAR_ICON_SIZE = 24;
const TEXT_TOOLBAR_TEXT_FORMAT_ICON_SIZE = 28;
const TEXT_TOOLBAR_TEXT_STYLE_ICON_SIZE = 28;
const TEXT_TOOLBAR_BUTTON_PADDING = 10;
const TEXT_TOOLBAR_HORIZONTAL_PADDING = 10;

const ALIGN_ACTIONS: AlignAction[] = [
  {
    accessibilityLabel: "텍스트 왼쪽 정렬",
    id: "left",
    title: "왼쪽 정렬",
    isSelected: (textElement) =>
      !textElement.textAlign || textElement.textAlign === "left",
    resolveUpdate: () => ({ textAlign: "left" }),
  },
  {
    accessibilityLabel: "텍스트 가운데 정렬",
    id: "center",
    title: "가운데 정렬",
    isSelected: (textElement) => textElement.textAlign === "center",
    resolveUpdate: () => ({ textAlign: "center" }),
  },
  {
    accessibilityLabel: "텍스트 오른쪽 정렬",
    id: "right",
    title: "오른쪽 정렬",
    isSelected: (textElement) => textElement.textAlign === "right",
    resolveUpdate: () => ({ textAlign: "right" }),
  },
];

export function RecapTextToolbar(props: RecapTextToolbarProps) {
  const {
    onDelete,
    onOpenColorPicker,
    onOpenTypographyPicker,
    onUpdateTextStyle,
    textElement,
  } = props;
  const styleMenuActions = STYLE_ACTIONS.map((action) => ({
    id: action.id,
    image: action.image,
    state: action.isSelected(textElement) ? ("on" as const) : ("off" as const),
    title: action.title,
  })).reverse();
  const alignMenuActions = ALIGN_ACTIONS.map((action) => ({
    id: action.id,
    state: action.isSelected(textElement) ? ("on" as const) : ("off" as const),
    title: action.title,
  }));
  const handleStyleMenuAction = (event: NativeActionEvent) => {
    const selectedAction = STYLE_ACTIONS.find(
      (action) => action.id === event.nativeEvent.event,
    );

    if (!selectedAction) {
      return;
    }

    onUpdateTextStyle(selectedAction.resolveUpdate(textElement));
  };
  const handleAlignMenuAction = (event: NativeActionEvent) => {
    const selectedAction = ALIGN_ACTIONS.find(
      (action) => action.id === event.nativeEvent.event,
    );

    if (!selectedAction) {
      return;
    }

    onUpdateTextStyle(selectedAction.resolveUpdate());
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(180)}
      exiting={FadeOutDown.duration(140)}
      pointerEvents="box-none"
      style={styles.root}
    >
      <View style={styles.toolbar}>
        <ToolbarButton
          accessibilityLabel="서체와 글자 크기 선택"
          onPress={onOpenTypographyPicker}
        >
          <TextFormatIcon
            color={appColors.black}
            size={TEXT_TOOLBAR_TEXT_FORMAT_ICON_SIZE}
          />
        </ToolbarButton>
        <ToolbarMenuButton
          accessibilityLabel="텍스트 스타일 선택"
          actions={styleMenuActions}
          onPressAction={handleStyleMenuAction}
        >
          <TextStyleIcon
            color={appColors.black}
            size={TEXT_TOOLBAR_TEXT_STYLE_ICON_SIZE}
          />
        </ToolbarMenuButton>
        <ToolbarMenuButton
          accessibilityLabel="텍스트 정렬 선택"
          actions={alignMenuActions}
          onPressAction={handleAlignMenuAction}
        >
          <ReiconIcon
            color={appColors.black}
            name="AlignHCenter"
            size={TEXT_TOOLBAR_ICON_SIZE}
          />
        </ToolbarMenuButton>
        <ToolbarButton
          accessibilityLabel="텍스트 색상 선택"
          onPress={onOpenColorPicker}
        >
          <View
            style={[styles.colorSwatch, { backgroundColor: textElement.color }]}
          />
        </ToolbarButton>
        <View style={styles.dividerSlot}>
          <View style={styles.divider} />
        </View>
        <ToolbarButton accessibilityLabel="텍스트 삭제" onPress={onDelete}>
          <ReiconIcon
            color={appColors.black}
            name="Trash5"
            size={TEXT_TOOLBAR_ICON_SIZE}
          />
        </ToolbarButton>
      </View>
    </Animated.View>
  );
}

function ToolbarMenuButton(props: {
  accessibilityLabel: string;
  actions: MenuAction[];
  children: ReactNode;
  onPressAction: (event: NativeActionEvent) => void;
}) {
  const { accessibilityLabel, actions, children, onPressAction } = props;

  return (
    <MenuView actions={actions} onPressAction={onPressAction}>
      <View
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={styles.toolbarButton}
      >
        {children}
      </View>
    </MenuView>
  );
}

function ToolbarButton(props: {
  accessibilityLabel: string;
  children: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
}) {
  const { accessibilityLabel, children, onPress } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      style={({ pressed }) => [
        styles.toolbarButton,
        pressed && styles.buttonPressed,
      ]}
      onPress={(event) => {
        event.stopPropagation();
        onPress?.(event);
      }}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonPressed: {
    opacity: 0.55,
  },
  colorSwatch: {
    borderColor: "rgba(18,18,18,0.16)",
    borderRadius: TEXT_TOOLBAR_ICON_SIZE / 2,
    borderWidth: 1,
    height: TEXT_TOOLBAR_ICON_SIZE,
    width: TEXT_TOOLBAR_ICON_SIZE,
  },
  divider: {
    backgroundColor: "rgba(18,18,18,0.22)",
    height: 28,
    width: 1,
  },
  dividerSlot: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    paddingHorizontal: TEXT_TOOLBAR_BUTTON_PADDING,
  },
  root: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  toolbar: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.68)",
    borderColor: "rgba(255,255,255,0.82)",
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: "row",
    height: 52,
    justifyContent: "center",
    maxWidth: TEXT_TOOLBAR_WIDTH,
    paddingHorizontal: TEXT_TOOLBAR_HORIZONTAL_PADDING,
    shadowColor: appColors.black,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    width: "100%",
  },
  toolbarButton: {
    alignItems: "center",
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    paddingHorizontal: TEXT_TOOLBAR_BUTTON_PADDING,
  },
});
