import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { RecapCanvasLayoutId } from "@/shared/recap/types";
import { NoLayoutIcon } from "@/presentation/components/atoms/no-layout-icon";
import { OnePhotoLayoutIcon } from "@/presentation/components/atoms/one-photo-layout-icon";
import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
import { ThreeRowLayoutIcon } from "@/presentation/components/atoms/three-row-layout-icon";
import { TwoRowLayoutIcon } from "@/presentation/components/atoms/two-row-layout-icon";
import { appColors } from "@/presentation/theme/colors";
import type { RecapCanvasLayoutId as RecapCanvasLayoutIdType } from "@/shared/recap/types";

type RecapLayoutToolbarProps = {
  selectedLayoutId: RecapCanvasLayoutIdType | null;
  onSelectLayout: (layoutId: RecapCanvasLayoutIdType | null) => void;
};

type RecapLayoutToolbarAction = {
  accessibilityLabel: string;
  id: RecapCanvasLayoutIdType | null;
  iconName?: "Grid10" | "Grid3";
  renderIcon?: (props: LayoutToolbarIconProps) => ReactNode;
};

type LayoutToolbarIconProps = {
  color: string;
  filled: boolean;
  size: number;
};

const RECAP_LAYOUT_TOOLBAR_ACTIONS: RecapLayoutToolbarAction[] = [
  {
    accessibilityLabel: "레이아웃 없음 선택",
    id: null,
    renderIcon: (props) => <NoLayoutIcon {...props} />,
  },
  {
    accessibilityLabel: "한 장 레이아웃 선택",
    id: RecapCanvasLayoutId.onePhoto,
    renderIcon: (props) => <OnePhotoLayoutIcon {...props} />,
  },
  {
    accessibilityLabel: "2열 레이아웃 선택",
    iconName: "Grid10",
    id: RecapCanvasLayoutId.twoColumns,
  },
  {
    accessibilityLabel: "2행 레이아웃 선택",
    id: RecapCanvasLayoutId.twoRows,
    renderIcon: (props) => <TwoRowLayoutIcon {...props} />,
  },
  {
    accessibilityLabel: "3행 레이아웃 선택",
    id: RecapCanvasLayoutId.threeRows,
    renderIcon: (props) => <ThreeRowLayoutIcon {...props} />,
  },
  {
    accessibilityLabel: "4칸 레이아웃 선택",
    iconName: "Grid3",
    id: RecapCanvasLayoutId.fourGrid,
  },
];

export function RecapLayoutToolbar(props: RecapLayoutToolbarProps) {
  const { onSelectLayout, selectedLayoutId } = props;

  return (
    <View style={styles.toolbar}>
      {RECAP_LAYOUT_TOOLBAR_ACTIONS.map((action) => {
        const isSelected = action.id === selectedLayoutId;
        const iconSize = isSelected ? 26 : 25;
        const iconProps = {
          color: appColors.black,
          filled: isSelected,
          size: iconSize,
        };
        const icon = action.renderIcon ? (
          action.renderIcon(iconProps)
        ) : (
          <ReiconIcon
            color={iconProps.color}
            name={action.iconName ?? "Grid10"}
            size={iconProps.size}
            weight={iconProps.filled ? "Filled" : "Outline"}
          />
        );

        return (
          <Pressable
            key={action.id}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel}
            accessibilityState={{ selected: isSelected }}
            hitSlop={10}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => onSelectLayout(action.id)}
          >
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 21,
    flex: 1,
    height: 42,
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.55,
  },
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
});
