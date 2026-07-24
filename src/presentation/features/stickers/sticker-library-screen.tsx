import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useState } from "react";

import { useStickerLibrary } from "@/application/hooks/use-sticker-library";
import type {
  StickerAsset,
  UserStickerAsset,
} from "@/application/services/stickers/types";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import type { ReiconName } from "@/presentation/components/atoms/reicon-icon";
import { SegmentedTabs } from "@/presentation/components/atoms/segmented-tabs";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { Menu } from "@/presentation/components/organisms/menu";
import { StickerAssetPreview } from "@/presentation/features/stickers/sticker-asset-preview";
import { StickerDetailSheet } from "@/presentation/components/organisms/sticker-detail-sheet";
import { appColors } from "@/presentation/theme/colors";
import { appSpacing } from "@/presentation/theme/spacing";

const ADD_ICON: ReiconName = "Add";
const LIBRARY_ICON: ReiconName = "Gallery";
const CLIPBOARD_ICON: ReiconName = "Clipboard";
const CARD_GAP = 22;
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

export function StickerLibraryScreen() {
  const {
    stickers,
    isLoading,
    isSaving,
    deleteUserSticker,
    registerFromClipboard,
    registerFromLibrary,
    updateUserStickerFavorite,
  } = useStickerLibrary();
  const [selectedSticker, setSelectedSticker] = useState<StickerAsset | null>(
    null,
  );
  const { width } = useWindowDimensions();
  const cardWidth = getStickerCardWidth(width);
  const currentSelectedSticker = selectedSticker
    ? (stickers.find((sticker) => sticker.id === selectedSticker.id) ??
      selectedSticker)
    : null;

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
        "클립보드에서 붙여넣을 이미지를 찾지 못했어요. iOS에서 붙여넣기 권한을 거부한 경우에도 이 안내가 표시될 수 있어요.",
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

  return (
    <AppSafeAreaView>
      <AppBar>
        <AppBar.Title variant="large">Stickers</AppBar.Title>
        <Menu
          accessibilityLabel="스티커 등록 메뉴 열기"
          trigger={{ icon: ADD_ICON }}
        >
          <Menu.Item
            icon={LIBRARY_ICON}
            label="갤러리에서 등록"
            onPress={() => {
              void handleRegisterFromLibrary();
            }}
          />
          <Menu.Item
            icon={CLIPBOARD_ICON}
            label="클립보드 붙여넣기"
            onPress={() => {
              void handleRegisterFromClipboard();
            }}
          />
        </Menu>
      </AppBar>

      <ScrollView
        contentContainerStyle={styles.content}
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
          <View style={styles.grid}>
            {stickers.map((asset) => (
              <StickerTile
                key={asset.id}
                asset={asset}
                tileSize={cardWidth}
                onOpenDetails={handleOpenStickerDetails}
              />
            ))}
          </View>
        )}

        {isSaving ? (
          <View style={styles.savingPanel}>
            <Text style={styles.savingText}>스티커를 저장하는 중이에요.</Text>
          </View>
        ) : null}
      </ScrollView>
      <StickerDetailSheet
        asset={currentSelectedSticker}
        isSaving={isSaving}
        visible={Boolean(selectedSticker)}
        onClose={handleCloseStickerDetails}
        onDeleteUserSticker={handleDeleteStickerFromDetails}
        onToggleUserStickerFavorite={handleToggleStickerFavorite}
      />
    </AppSafeAreaView>
  );
}

function StickerTile(props: {
  asset: StickerAsset;
  tileSize: number;
  onOpenDetails: (asset: StickerAsset) => void;
}) {
  const { asset, onOpenDetails, tileSize } = props;
  const title = asset.name ?? "Sticker";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint="길게 눌러 스티커 상세보기"
      delayLongPress={260}
      style={({ pressed }) => [
        styles.stickerTile,
        pressed && styles.stickerTilePressed,
        {
          height: tileSize,
          width: tileSize,
        },
      ]}
      onLongPress={() => onOpenDetails(asset)}
    >
      <StickerAssetPreview asset={asset} />
    </Pressable>
  );
}

function getStickerCardWidth(windowWidth: number): number {
  const contentWidth = windowWidth - appSpacing.screenHorizontalPadding * 2;
  const columnCount = contentWidth >= 720 ? 4 : 3;
  const totalGap = CARD_GAP * (columnCount - 1);

  return Math.floor((contentWidth - totalGap) / columnCount);
}

const styles = StyleSheet.create({
  content: {
    gap: 28,
    paddingBottom: appSpacing.screenContentBottomPadding,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
    paddingTop: appSpacing.screenContentTopPadding,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  stickerTile: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    position: "relative",
  },
  stickerTilePressed: {
    opacity: 0.72,
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
  savingText: {
    color: appColors.white,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 20,
  },
});
