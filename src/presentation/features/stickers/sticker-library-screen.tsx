import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeOutDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStickerLibrary } from "@/application/hooks/use-sticker-library";
import { getStickerLibraryGridLayout } from "@/presentation/helpers/stickers/sticker-library-layout";
import type {
  StickerAsset,
  UserStickerAsset,
} from "@/application/services/stickers/types";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import { Menu } from "@/presentation/components/molecules/menu";
import { SegmentedTabs } from "@/presentation/components/molecules/segmented-tabs";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { StickerDetailSheet } from "@/presentation/components/organisms/sticker-detail-sheet";
import { StickerTile } from "@/presentation/components/organisms/sticker-tile";
import { useAppBottomNavigationHidden } from "@/presentation/providers/app-bottom-navigation-controller";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";
import { appSpacing } from "@/presentation/theme/spacing";

const STICKER_TAB_OPTIONS = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Recents",
    value: "recents",
  },
] as const;

const ACTION_BAR_ENTERING = FadeInDown.duration(350)
  .easing(Easing.bezier(0.22, 1, 0.36, 1))
  .withInitialValues({
    opacity: 0,
    transform: [{ translateY: 16 }, { scale: 0.97 }],
  });
const ACTION_BAR_EXITING = FadeOutDown.duration(250).easing(
  Easing.bezier(0.22, 1, 0.36, 1),
);

export function StickerLibraryScreen() {
  const {
    stickers,
    isLoading,
    isSaving,
    deleteUserSticker,
    deleteUserStickers,
    registerFromClipboard,
    registerFromLibrary,
    updateUserStickerFavorite,
  } = useStickerLibrary();
  const [selectedSticker, setSelectedSticker] = useState<StickerAsset | null>(
    null,
  );
  const [selectedStickerIdSet, setSelectedStickerIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { cardGap, cardWidth } = getStickerLibraryGridLayout(
    width,
    appSpacing.screenHorizontalPadding,
  );
  const userStickerIds = useMemo(
    () =>
      stickers
        .filter(
          (sticker): sticker is UserStickerAsset =>
            sticker.source === "sticker",
        )
        .map((sticker) => sticker.id),
    [stickers],
  );
  const userStickerIdSet = useMemo(
    () => new Set(userStickerIds),
    [userStickerIds],
  );
  const selectedStickerIds = useMemo(
    () =>
      new Set(
        Array.from(selectedStickerIdSet).filter((assetId) =>
          userStickerIdSet.has(assetId),
        ),
      ),
    [selectedStickerIdSet, userStickerIdSet],
  );
  const allUserStickersSelected =
    userStickerIds.length > 0 &&
    userStickerIds.every((assetId) => selectedStickerIds.has(assetId));
  const currentSelectedSticker = selectedSticker
    ? (stickers.find((sticker) => sticker.id === selectedSticker.id) ??
      selectedSticker)
    : null;
  const bottomActionOffset = Math.max(insets.bottom - 10, 8);

  useAppBottomNavigationHidden(isSelectionMode);

  const handleRegisterFromLibrary = async () => {
    const result = await registerFromLibrary();

    if (result === "failed") {
      Alert.alert("등록 실패", "스티커 이미지를 저장하지 못했어요.");
    }
  };

  const handleRegisterFromClipboard = async () => {
    const result = await registerFromClipboard();

    if (result === "empty") {
      Alert.alert(
        "이미지 없음",
        "기기 클립보드에서 붙여넣을 이미지를 찾지 못했어요.",
      );
      return;
    }

    if (result === "denied") {
      Alert.alert(
        "권한 필요",
        "클립보드 이미지를 읽을 수 있도록 붙여넣기 권한을 허용해 주세요.",
      );
      return;
    }

    if (result === "nativeModuleUnavailable") {
      Alert.alert(
        "앱 재설치 필요",
        "클립보드 붙여넣기를 사용하려면 expo-clipboard가 포함된 개발용 앱을 다시 빌드해서 설치해야 해요.",
      );
      return;
    }

    if (result === "failed") {
      Alert.alert("등록 실패", "클립보드 이미지를 스티커로 저장하지 못했어요.");
    }
  };

  const handleOpenStickerDetails = (asset: StickerAsset) => {
    if (isSelectionMode) {
      return;
    }

    setSelectedSticker(asset);
  };

  const handleCloseStickerDetails = () => {
    setSelectedSticker(null);
  };

  const handleDeleteStickerFromDetails = async (asset: UserStickerAsset) => {
    const wasDeleted = await deleteUserSticker(asset.id);

    if (!wasDeleted) {
      Alert.alert("삭제 실패", "스티커를 삭제하지 못했어요.");
      return false;
    }

    setSelectedSticker(null);
    return true;
  };

  const handleToggleStickerFavorite = async (asset: UserStickerAsset) => {
    const updatedSticker = await updateUserStickerFavorite(
      asset.id,
      !asset.isFavorite,
    );

    if (!updatedSticker) {
      Alert.alert("저장 실패", "즐겨찾기 상태를 저장하지 못했어요.");
      return false;
    }

    setSelectedSticker(updatedSticker);
    return true;
  };

  const handleToggleStickerSelection = (asset: StickerAsset) => {
    if (asset.source !== "sticker") {
      return;
    }

    setIsSelectionMode(true);
    setSelectedStickerIds((current) => {
      const nextSelectedStickerIds = new Set(current);

      if (nextSelectedStickerIds.has(asset.id)) {
        nextSelectedStickerIds.delete(asset.id);
      } else {
        nextSelectedStickerIds.add(asset.id);
      }

      return nextSelectedStickerIds;
    });
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedStickerIds(new Set());
  };

  const handleSelectAllUserStickers = () => {
    setSelectedStickerIds(new Set(userStickerIds));
  };

  const handleClearAllSelectedStickers = () => {
    setSelectedStickerIds(new Set());
  };

  const handleDeleteSelectedStickers = () => {
    const selectedIds = Array.from(selectedStickerIds);

    if (selectedIds.length === 0 || isSaving) {
      return;
    }

    Alert.alert(
      "스티커 삭제",
      `선택한 스티커 ${selectedIds.length}개를 삭제할까요?`,
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            void deleteUserStickers(selectedIds).then(
              ({ deletedIds, failedIds }) => {
                if (deletedIds.length > 0) {
                  setIsSelectionMode(false);
                  setSelectedStickerIds(new Set());
                } else {
                  setSelectedStickerIds(
                    new Set(
                      selectedIds.filter((assetId) =>
                        failedIds.includes(assetId),
                      ),
                    ),
                  );
                }

                if (failedIds.length === 0) {
                  return;
                }

                Alert.alert("삭제 실패", "일부 스티커를 삭제하지 못했어요.");
              },
            );
          },
        },
      ],
    );
  };

  return (
    <AppSafeAreaView>
      <AppBar>
        <AppBar.Title variant="large">Stickers</AppBar.Title>
        <Menu
          accessibilityLabel="스티커 등록 메뉴 열기"
          disabled={isSelectionMode}
          trigger={{ icon: "Add" }}
        >
          <Menu.Item
            icon="Gallery"
            label="갤러리에서 등록"
            onPress={() => {
              void handleRegisterFromLibrary();
            }}
          />
          <Menu.Item
            icon="Clipboard"
            label="클립보드 붙여넣기"
            onPress={() => {
              void handleRegisterFromClipboard();
            }}
          />
        </Menu>
      </AppBar>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          isSelectionMode && styles.contentWithSelectionActionBar,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SegmentedTabs
          options={STICKER_TAB_OPTIONS}
          value="all"
          onValueChange={() => undefined}
        />

        {isLoading ? (
          <View style={styles.emptyPanel}>
            <Text style={styles.emptyText}>스티커를 불러오는 중이에요.</Text>
          </View>
        ) : (
          <View style={[styles.grid, { gap: cardGap }]}>
            {stickers.map((asset) => (
              <StickerTile
                key={asset.id}
                asset={asset}
                isSelectable={asset.source === "sticker"}
                isSelected={selectedStickerIds.has(asset.id)}
                selectionMode={isSelectionMode}
                showsSelectionControl
                tileSize={cardWidth}
                onOpenDetails={handleOpenStickerDetails}
                onToggleSelection={handleToggleStickerSelection}
              />
            ))}
          </View>
        )}

        {isSaving && (
          <View style={styles.savingPanel}>
            <Text style={styles.savingText}>스티커를 저장하는 중이에요.</Text>
          </View>
        )}
      </ScrollView>
      <StickerDetailSheet
        asset={currentSelectedSticker}
        isSaving={isSaving}
        visible={Boolean(selectedSticker)}
        onClose={handleCloseStickerDetails}
        onDeleteUserSticker={handleDeleteStickerFromDetails}
        onToggleUserStickerFavorite={handleToggleStickerFavorite}
      />
      {isSelectionMode && (
        <StickerSelectionActionBar
          allSelected={allUserStickersSelected}
          bottomOffset={bottomActionOffset}
          isSaving={isSaving}
          selectedCount={selectedStickerIds.size}
          onCancel={handleCancelSelection}
          onClearAll={handleClearAllSelectedStickers}
          onDelete={handleDeleteSelectedStickers}
          onSelectAll={handleSelectAllUserStickers}
        />
      )}
    </AppSafeAreaView>
  );
}

function StickerSelectionActionBar(props: {
  allSelected: boolean;
  bottomOffset: number;
  isSaving: boolean;
  selectedCount: number;
  onCancel: () => void;
  onClearAll: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
}) {
  const {
    allSelected,
    bottomOffset,
    isSaving,
    onCancel,
    onClearAll,
    onDelete,
    onSelectAll,
    selectedCount,
  } = props;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.selectionOverlay, { bottom: bottomOffset }]}
    >
      <Animated.View
        entering={ACTION_BAR_ENTERING}
        exiting={ACTION_BAR_EXITING}
        style={styles.selectionBar}
      >
        <SelectionActionButton label="취소" onPress={onCancel} />
        <SelectionActionButton
          label={allSelected ? "모두 해제" : "모두 선택"}
          onPress={allSelected ? onClearAll : onSelectAll}
        />
        <SelectionActionButton
          accessibilityLabel={`선택한 스티커 ${selectedCount}개 삭제`}
          disabled={isSaving}
          label="삭제"
          onPress={onDelete}
        />
      </Animated.View>
    </View>
  );
}

function SelectionActionButton(props: {
  accessibilityLabel?: string;
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  const { accessibilityLabel, disabled = false, label, onPress } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      style={({ pressed }) => [
        styles.selectionActionButton,
        pressed && !disabled && styles.selectionActionButtonPressed,
        disabled && styles.selectionActionButtonDisabled,
      ]}
      onPress={onPress}
    >
      <Text style={styles.selectionActionButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 28,
    paddingBottom: appSpacing.screenContentBottomPadding,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
    paddingTop: appSpacing.screenContentTopPadding,
  },
  contentWithSelectionActionBar: {
    paddingBottom: appSpacing.screenContentBottomPadding + 72,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emptyPanel: {
    alignItems: "center",
    backgroundColor: appColors.white,
    borderColor: "#ECEFF3",
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    minHeight: 132,
    padding: 20,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
    textAlign: "center",
  },
  savingPanel: {
    alignItems: "center",
    backgroundColor: appColors.black,
    borderCurve: "continuous",
    borderRadius: 18,
    justifyContent: "center",
    padding: 14,
  },
  selectionActionButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.68)",
    borderColor: "rgba(255,255,255,0.82)",
    borderRadius: 21,
    borderWidth: 1,
    flex: 1,
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  selectionActionButtonDisabled: {
    opacity: 0.45,
  },
  selectionActionButtonLabel: {
    color: appColors.black,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
  },
  selectionActionButtonPressed: {
    backgroundColor: "rgba(18,18,18,0.16)",
  },
  selectionBar: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    height: 52,
    maxWidth: 316,
    paddingHorizontal: 6,
    shadowColor: appColors.black,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    width: "100%",
  },
  selectionOverlay: {
    alignItems: "center",
    elevation: 6,
    left: 0,
    paddingHorizontal: 36,
    position: "absolute",
    right: 0,
    zIndex: appLayers.bottomNavigation,
  },
  savingText: {
    color: appColors.white,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 20,
  },
});
