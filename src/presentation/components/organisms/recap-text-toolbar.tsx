import { type ReactNode } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

import {
  isRecapTextAlignmentSelected,
  isRecapTextStyleSelected,
  resolveRecapTextAlignmentUpdate,
  resolveRecapTextStyleUpdate,
  type RecapTextAlignmentActionId,
  type RecapTextStyleActionId,
  type RecapTextStyleUpdate,
} from "@/application/services/recap/recap-canvas-text";
import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
import { TextFormatIcon } from "@/presentation/components/atoms/text-format-icon";
import { TextStyleIcon } from "@/presentation/components/atoms/text-style-icon";
import { RecapTextMenuButton } from "@/presentation/components/molecules/recap-text-menu-button";
import type { RecapTextMenuIconName } from "@/presentation/components/molecules/recap-text-menu-button.types";
import { orderNativeMenuActions } from "@/presentation/helpers/controls/native-menu-actions";
import { appColors } from "@/presentation/theme/colors";
import type { RecapCanvasTextElement } from "@/shared/recap/types";

type RecapTextToolbarProps = {
  canMoveBackward: boolean;
  canMoveForward: boolean;
  textElement: RecapCanvasTextElement;
  onDelete: () => void;
  onOpenColorPicker: () => void;
  onOpenTypographyPicker: () => void;
  onMoveBackward: () => void;
  onMoveForward: () => void;
  onUpdateTextStyle: (update: RecapTextStyleUpdate) => void;
};

type StyleAction = {
  id: RecapTextStyleActionId;
  icon: RecapTextMenuIconName;
  title: string;
};

type AlignAction = {
  id: RecapTextAlignmentActionId;
  icon: RecapTextMenuIconName;
  title: string;
};

type LayerAction = {
  id: "backward" | "forward";
  icon: RecapTextMenuIconName;
  title: string;
};

const STYLE_ACTIONS: StyleAction[] = [
  {
    id: "bold",
    icon: "bold",
    title: "굵게",
  },
  {
    id: "italic",
    icon: "italic",
    title: "기울임",
  },
  {
    id: "underline",
    icon: "underline",
    title: "밑줄",
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
    id: "left",
    icon: "alignLeft",
    title: "왼쪽 정렬",
  },
  {
    id: "center",
    icon: "alignCenter",
    title: "가운데 정렬",
  },
  {
    id: "right",
    icon: "alignRight",
    title: "오른쪽 정렬",
  },
];

const LAYER_ACTIONS: LayerAction[] = [
  {
    id: "forward",
    icon: "layerForward",
    title: "앞으로",
  },
  {
    id: "backward",
    icon: "layerBackward",
    title: "뒤로",
  },
];

export function RecapTextToolbar(props: RecapTextToolbarProps) {
  const {
    canMoveBackward,
    canMoveForward,
    onDelete,
    onOpenColorPicker,
    onOpenTypographyPicker,
    onMoveBackward,
    onMoveForward,
    onUpdateTextStyle,
    textElement,
  } = props;
  const styleMenuActions = orderNativeMenuActions(
    STYLE_ACTIONS.map((action) => ({
      id: action.id,
      icon: action.icon,
      selected: isRecapTextStyleSelected(textElement, action.id),
      title: action.title,
    })),
  );
  const alignMenuActions = orderNativeMenuActions(
    ALIGN_ACTIONS.map((action) => ({
      id: action.id,
      icon: action.icon,
      selected: isRecapTextAlignmentSelected(textElement, action.id),
      title: action.title,
    })),
  );
  const layerMenuActions = orderNativeMenuActions(
    LAYER_ACTIONS.map((action) => ({
      disabled: action.id === "forward" ? !canMoveForward : !canMoveBackward,
      id: action.id,
      icon: action.icon,
      title: action.title,
    })),
  );
  const handleStyleMenuAction = (actionId: string) => {
    const selectedAction = STYLE_ACTIONS.find(
      (action) => action.id === actionId,
    );

    if (!selectedAction) {
      return;
    }

    onUpdateTextStyle(
      resolveRecapTextStyleUpdate(textElement, selectedAction.id),
    );
  };
  const handleAlignMenuAction = (actionId: string) => {
    const selectedAction = ALIGN_ACTIONS.find(
      (action) => action.id === actionId,
    );

    if (!selectedAction) {
      return;
    }

    onUpdateTextStyle(resolveRecapTextAlignmentUpdate(selectedAction.id));
  };
  const handleLayerMenuAction = (actionId: string) => {
    if (actionId === "forward") {
      onMoveForward();
      return;
    }

    if (actionId === "backward") {
      onMoveBackward();
    }
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
        <RecapTextMenuButton
          accessibilityLabel="텍스트 스타일 선택"
          actions={styleMenuActions}
          onPressAction={handleStyleMenuAction}
        >
          <TextStyleIcon
            color={appColors.black}
            size={TEXT_TOOLBAR_TEXT_STYLE_ICON_SIZE}
          />
        </RecapTextMenuButton>
        <RecapTextMenuButton
          accessibilityLabel="텍스트 정렬 선택"
          actions={alignMenuActions}
          onPressAction={handleAlignMenuAction}
        >
          <ReiconIcon
            color={appColors.black}
            name="TextalignCenter"
            size={TEXT_TOOLBAR_ICON_SIZE}
          />
        </RecapTextMenuButton>
        <RecapTextMenuButton
          accessibilityLabel="텍스트 레이어 순서 선택"
          actions={layerMenuActions}
          onPressAction={handleLayerMenuAction}
        >
          <ReiconIcon name="Layers" size={TEXT_TOOLBAR_ICON_SIZE} />
        </RecapTextMenuButton>
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
