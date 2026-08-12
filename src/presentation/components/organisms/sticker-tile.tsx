import { Pressable, StyleSheet } from "react-native";

import type { StickerAsset } from "@/application/services/stickers/types";
import { SelectionCheckbox } from "@/presentation/components/atoms/selection-checkbox";
import { StickerAssetPreview } from "@/presentation/components/organisms/sticker-asset-preview";

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
    showsSelectionControl = isSelectable,
    tileSize,
  } = props;
  const title = asset.name ?? "Sticker";
  const canOpenDetails = Boolean(onOpenDetails);
  const accessibilityHint =
    isSelectable && canOpenDetails
      ? "탭하여 스티커 선택, 길게 눌러 스티커 상세보기"
      : isSelectable
        ? "탭하여 스티커 선택"
        : selectionMode
          ? "스티커 선택 상태 변경"
          : canOpenDetails
            ? "길게 눌러 스티커 상세보기"
            : undefined;

  const handlePress = () => {
    if (isSelectable) {
      onToggleSelection?.(asset);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected: isSelected }}
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
      onLongPress={onOpenDetails ? () => onOpenDetails(asset) : undefined}
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
    justifyContent: "center",
    overflow: "visible",
    position: "relative",
  },
  rootSelected: {
    opacity: 0.92,
  },
  selectionControl: {
    position: "absolute",
    right: 4,
    top: 4,
  },
});
