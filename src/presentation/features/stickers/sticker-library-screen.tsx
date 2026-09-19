import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { AppText as Text } from "@/presentation/components/atoms/app-text";
import Animated, {
  Easing,
  FadeInDown,
  FadeOutDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStickerLibrary } from "@/application/hooks/use-sticker-library";
import { translate } from "@/application/services/localization/app-i18n";
import type {
  StickerAsset,
  UserStickerAsset,
} from "@/application/services/stickers/types";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
import { StickerRegistrationMenu } from "@/presentation/components/molecules/sticker-registration-menu";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { StickerDetailSheet } from "@/presentation/components/organisms/sticker-detail-sheet";
import { StickerTile } from "@/presentation/components/organisms/sticker-tile";
import { getStickerLibraryGridLayout } from "@/presentation/helpers/stickers/sticker-library-layout";
import { useAppBottomNavigationHidden } from "@/presentation/providers/app-bottom-navigation-controller";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";
import { appSpacing } from "@/presentation/theme/spacing";

const EMPTY_STATE_FOREGROUND_COLOR = "rgba(18,18,18,0.54)";

const ACTION_BAR_ENTERING = FadeInDown.duration(350)
  .easing(Easing.bezier(0.22, 1, 0.36, 1))
  .withInitialValues({
    opacity: 0,
    transform: [{ translateY: 16 }],
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
  const userStickerAssets = useMemo(
    () =>
      stickers.filter(
        (sticker): sticker is UserStickerAsset => sticker.source === "sticker",
      ),
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
      Alert.alert(
        translate("stickers.registerFailedTitle"),
        translate("stickers.registerFailedMessage"),
      );
    }
  };

  const handleRegisterFromClipboard = async () => {
    const result = await registerFromClipboard();

    if (result === "empty") {
      Alert.alert(
        translate("stickers.imageMissingTitle"),
        translate("stickers.clipboardMissingMessage"),
      );
      return;
    }

    if (result === "denied") {
      Alert.alert(
        translate("stickers.permissionTitle"),
        translate("stickers.clipboardDeniedMessage"),
      );
      return;
    }

    if (result === "nativeModuleUnavailable") {
      Alert.alert(
        translate("stickers.nativeModuleTitle"),
        translate("stickers.nativeModuleMessage"),
      );
      return;
    }

    if (result === "failed") {
      Alert.alert(
        translate("stickers.registerFailedTitle"),
        translate("stickers.registerClipboardFailedMessage"),
      );
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
      Alert.alert(
        translate("stickers.deleteFailedTitle"),
        translate("stickers.deleteFailedMessage"),
      );
      return false;
    }

    setSelectedSticker(null);
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
      translate("stickers.deleteTitle"),
      translate("stickers.deleteManyMessage", { count: selectedIds.length }),
      [
        {
          text: translate("common.cancel"),
          style: "cancel",
        },
        {
          text: translate("common.delete"),
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

                Alert.alert(
                  translate("stickers.deleteFailedTitle"),
                  translate("stickers.someDeleteFailedMessage"),
                );
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
        <AppBar.Title variant="large">
          {translate("screen.stickers")}
        </AppBar.Title>
        {!isLoading && userStickerAssets.length > 0 && (
          <StickerRegistrationMenu
            disabled={isSelectionMode || isSaving}
            onRegisterFromClipboard={() => {
              void handleRegisterFromClipboard();
            }}
            onRegisterFromLibrary={() => {
              void handleRegisterFromLibrary();
            }}
          >
            <View
              accessible
              accessibilityRole="button"
              accessibilityLabel={translate("stickers.registerMenu")}
              accessibilityState={{
                busy: isSaving,
                disabled: isSelectionMode || isSaving,
              }}
              style={[
                styles.registrationMenuTrigger,
                (isSelectionMode || isSaving) &&
                  styles.registrationMenuTriggerDisabled,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color={appColors.white} size="small" />
              ) : (
                <ReiconIcon color={appColors.white} name="Add" size={24} />
              )}
            </View>
          </StickerRegistrationMenu>
        )}
      </AppBar>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          isSelectionMode && styles.contentWithSelectionActionBar,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={appColors.black} size="small" />
            <Text style={styles.loadingText}>
              {translate("stickers.loading")}
            </Text>
          </View>
        ) : userStickerAssets.length === 0 ? (
          <StickerEmptyState
            isSaving={isSaving}
            onRegisterFromClipboard={() => {
              void handleRegisterFromClipboard();
            }}
            onRegisterFromLibrary={() => {
              void handleRegisterFromLibrary();
            }}
          />
        ) : (
          <View style={[styles.grid, { gap: cardGap }]}>
            {userStickerAssets.map((asset) => (
              <StickerTile
                key={asset.id}
                asset={asset}
                isSelectable={asset.source === "sticker"}
                isSelected={selectedStickerIds.has(asset.id)}
                selectionMode={isSelectionMode}
                tileSize={cardWidth}
                onOpenDetails={handleOpenStickerDetails}
                onToggleSelection={handleToggleStickerSelection}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <StickerDetailSheet
        asset={currentSelectedSticker}
        isSaving={isSaving}
        visible={Boolean(selectedSticker)}
        onClose={handleCloseStickerDetails}
        onDeleteUserSticker={handleDeleteStickerFromDetails}
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

function StickerEmptyState(props: {
  isSaving: boolean;
  onRegisterFromClipboard: () => void;
  onRegisterFromLibrary: () => void;
}) {
  const { isSaving, onRegisterFromClipboard, onRegisterFromLibrary } = props;

  return (
    <View style={styles.emptyState}>
      <ReiconIcon
        color={EMPTY_STATE_FOREGROUND_COLOR}
        name="EmojiCircle"
        size={56}
      />
      <View style={styles.emptyStateCopy}>
        <Text style={styles.emptyStateTitle}>
          {translate("stickers.emptyTitle")}
        </Text>
        <Text style={styles.emptyStateDescription}>
          {translate("stickers.emptyDescription")}
        </Text>
      </View>
      <StickerRegistrationMenu
        disabled={isSaving}
        onRegisterFromClipboard={onRegisterFromClipboard}
        onRegisterFromLibrary={onRegisterFromLibrary}
      >
        <View
          accessible
          accessibilityRole="button"
          accessibilityLabel={translate("stickers.registerMenu")}
          accessibilityState={{ busy: isSaving, disabled: isSaving }}
          style={[
            styles.emptyStateRegistrationButton,
            isSaving && styles.registrationMenuTriggerDisabled,
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color={appColors.white} size="small" />
          ) : (
            <>
              <ReiconIcon color={appColors.white} name="Add" size={20} />
              <Text style={styles.emptyStateRegistrationButtonLabel}>
                {translate("stickers.register")}
              </Text>
            </>
          )}
        </View>
      </StickerRegistrationMenu>
    </View>
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
        <SelectionActionButton
          label={translate("common.cancel")}
          onPress={onCancel}
        />
        <SelectionActionButton
          label={
            allSelected
              ? translate("stickers.clearAll")
              : translate("stickers.selectAll")
          }
          onPress={allSelected ? onClearAll : onSelectAll}
        />
        <SelectionActionButton
          accessibilityLabel={translate("stickers.deleteManyAccessibility", {
            count: selectedCount,
          })}
          disabled={isSaving}
          isLoading={isSaving}
          label={translate("common.delete")}
          onPress={onDelete}
        />
      </Animated.View>
    </View>
  );
}

function SelectionActionButton(props: {
  accessibilityLabel?: string;
  disabled?: boolean;
  isLoading?: boolean;
  label: string;
  onPress: () => void;
}) {
  const {
    accessibilityLabel,
    disabled = false,
    isLoading = false,
    label,
    onPress,
  } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ busy: isLoading, disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.selectionActionButton,
        pressed && !disabled && styles.selectionActionButtonPressed,
        disabled && styles.selectionActionButtonDisabled,
      ]}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator color={appColors.black} size="small" />
      ) : (
        <Text style={styles.selectionActionButtonLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
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
  emptyState: {
    alignItems: "center",
    gap: 24,
    paddingTop: 72,
  },
  emptyStateCopy: {
    alignItems: "center",
    gap: 6,
  },
  emptyStateDescription: {
    color: EMPTY_STATE_FOREGROUND_COLOR,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    textAlign: "center",
  },
  emptyStateRegistrationButton: {
    alignItems: "center",
    backgroundColor: appColors.black,
    borderRadius: 22,
    flexDirection: "row",
    gap: 8,
    height: 44,
    justifyContent: "center",
    minWidth: 144,
    paddingHorizontal: 20,
  },
  emptyStateRegistrationButtonLabel: {
    color: appColors.white,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
  },
  emptyStateTitle: {
    color: EMPTY_STATE_FOREGROUND_COLOR,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 24,
  },
  registrationMenuTrigger: {
    alignItems: "center",
    backgroundColor: appColors.blackOverlay26,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  registrationMenuTriggerDisabled: {
    opacity: 0.38,
  },
  loadingState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 72,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
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
});
