import { Pressable, StyleSheet } from "react-native";

import type { StickerAsset } from "@/application/services/stickers/types";
import { SelectionCheckbox } from "@/presentation/components/atoms/selection-checkbox";
import { StickerAssetPreview } from "@/presentation/components/organisms/sticker-asset-preview";
import { appColors } from "@/presentation/theme/colors";

const STICKER_TILE_SELECTION_CONTROL_SIZE = 22;

export type StickerTileProps = {
  asset: StickerAsset;
  isSelectable?: boolean;
  isSelected?: boolean;
  selectionMode?: boolean;
  showsSelectionControl?: boolean;
  tileSize: number;
  onOpenDetails?: (asset: StickerAsset) => void;
  onToggleSelection?: (asset: StickerAsset) => void;
};

export function StickerTile(props: StickerTileProps) {
  const {
    asset,
    isSelectable = false,
    isSelected = false,
    onOpenDetails,
    onToggleSelection,
    selectionMode = false,
    showsSelectionControl = selectionMode && isSelectable,
    tileSize,
  } = props;
  const title = asset.name ?? "Sticker";
  const canOpenDetails = Boolean(onOpenDetails);
  const accessibilityHint =
    selectionMode && isSelectable
      ? "탭하여 선택 상태 변경"
      : isSelectable && canOpenDetails
        ? "탭하여 크게 보기, 길게 눌러 선택"
        : isSelectable
          ? "탭하여 선택"
          : canOpenDetails
            ? "탭하여 크게 보기"
            : undefined;

  const handlePress = () => {
    if (isSelectable && (selectionMode || !canOpenDetails)) {
      onToggleSelection?.(asset);
      return;
    }

    onOpenDetails?.(asset);
  };

  const handleLongPress = () => {
    if (!selectionMode && isSelectable && canOpenDetails) {
      onToggleSelection?.(asset);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        selected: selectionMode ? isSelected : undefined,
      }}
      delayLongPress={260}
      style={({ pressed }) => [
        styles.root,
        isSelected && styles.rootSelected,
        pressed && styles.pressed,
        {
          height: tileSize,
          width: tileSize,
        },
      ]}
      onPress={handlePress}
      onLongPress={isSelectable && canOpenDetails ? handleLongPress : undefined}
    >
      <StickerAssetPreview asset={asset} />
      {showsSelectionControl && (
        <StickerTileSelectionControl
          accessibilityLabel={
            isSelectable ? `${title} 선택` : `${title} 선택 불가`
          }
          disabled={!isSelectable}
          isSelected={isSelected}
          onPress={() => onToggleSelection?.(asset)}
        />
      )}
    </Pressable>
  );
}

function StickerTileSelectionControl(props: {
  accessibilityLabel: string;
  disabled: boolean;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { accessibilityLabel, disabled, isSelected, onPress } = props;

  return (
    <SelectionCheckbox
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      isSelected={isSelected}
      size={STICKER_TILE_SELECTION_CONTROL_SIZE}
      style={styles.selectionControl}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.72,
  },
  root: {
    alignItems: "center",
    backgroundColor: appColors.white,
    borderRadius: 20,
    justifyContent: "center",
    overflow: "hidden",
    padding: 12,
    position: "relative",
  },
  rootSelected: {
    opacity: 0.92,
  },
  selectionControl: {
    position: "absolute",
    right: 8,
    top: 8,
  },
});
