import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
import { appColors } from "@/presentation/theme/colors";

type RecapElementLayerToolbarProps = {
  canMoveBackward: boolean;
  canMoveForward: boolean;
  onDelete: () => void;
  onMoveBackward: () => void;
  onMoveForward: () => void;
};

const TOOLBAR_ICON_SIZE = 24;

export function RecapElementLayerToolbar(props: RecapElementLayerToolbarProps) {
  const {
    canMoveBackward,
    canMoveForward,
    onDelete,
    onMoveBackward,
    onMoveForward,
  } = props;

  return (
    <Animated.View
      entering={FadeInDown.duration(180)}
      exiting={FadeOutDown.duration(140)}
      style={styles.toolbar}
    >
      <ToolbarButton
        accessibilityLabel="요소 앞으로 이동"
        disabled={!canMoveForward}
        icon="LayersArrowUp"
        onPress={onMoveForward}
      />
      <ToolbarButton
        accessibilityLabel="요소 뒤로 이동"
        disabled={!canMoveBackward}
        icon="LayersArrowDown"
        onPress={onMoveBackward}
      />
      <View style={styles.dividerSlot}>
        <View style={styles.divider} />
      </View>
      <ToolbarButton
        accessibilityLabel="요소 삭제"
        icon="Trash5"
        onPress={onDelete}
      />
    </Animated.View>
  );
}

function ToolbarButton(props: {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: "LayersArrowDown" | "LayersArrowUp" | "Trash5";
  onPress: () => void;
}) {
  const { accessibilityLabel, disabled = false, icon, onPress } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={10}
      style={({ pressed }) => [
        styles.toolbarButton,
        disabled && styles.toolbarButtonDisabled,
        pressed && styles.toolbarButtonPressed,
      ]}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
    >
      <ReiconIcon
        color={appColors.black}
        name={icon}
        size={TOOLBAR_ICON_SIZE}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  divider: {
    backgroundColor: "rgba(18,18,18,0.22)",
    height: 28,
    width: 1,
  },
  dividerSlot: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 10,
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
    maxWidth: 220,
    paddingHorizontal: 10,
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
    paddingHorizontal: 10,
  },
  toolbarButtonPressed: {
    opacity: 0.55,
  },
  toolbarButtonDisabled: {
    opacity: 0.34,
  },
});
