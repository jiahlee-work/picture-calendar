import type { ReactNode } from "react";
import { Image } from "expo-image";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { useStickerLibrary } from "@/application/hooks/use-sticker-library";
import type {
  BuiltInStickerAsset,
  StickerAsset,
  UserStickerAsset,
} from "@/application/services/stickers/types";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import {
  ReiconIcon,
  type ReiconName,
} from "@/presentation/components/atoms/reicon-icon";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { Menu } from "@/presentation/components/organisms/menu";
import { appColors } from "@/presentation/theme/colors";
import { appSpacing } from "@/presentation/theme/spacing";

const ADD_ICON: ReiconName = "Add";
const LIBRARY_ICON: ReiconName = "Gallery";
const CLIPBOARD_ICON: ReiconName = "Clipboard";
const TRASH_ICON: ReiconName = "Trash2";
const CARD_GAP = 12;

export function StickerLibraryScreen() {
  const {
    stickers,
    isLoading,
    isSaving,
    deleteUserSticker,
    registerFromClipboard,
    registerFromLibrary,
  } = useStickerLibrary();
  const { width } = useWindowDimensions();
  const cardWidth = getStickerCardWidth(width);
  const builtInStickers = stickers.filter(isBuiltInStickerAsset);
  const userStickers = stickers.filter(isUserStickerAsset);

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

  const handleDeleteUserSticker = (asset: UserStickerAsset) => {
    Alert.alert("스티커 삭제", "이 스티커를 삭제할까요?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          void deleteUserSticker(asset.id).then((wasDeleted) => {
            if (!wasDeleted) {
              Alert.alert("삭제 실패", "스티커를 삭제하지 못했어요.");
            }
          });
        },
      },
    ]);
  };

  return (
    <AppSafeAreaView>
      <AppBar>
        <AppBar.Title>Stickers</AppBar.Title>
        <View style={styles.appBarActions}>
          <Menu
            accessibilityLabel="스티커 등록 메뉴 열기"
            trigger={{ icon: ADD_ICON, label: "등록" }}
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
        </View>
      </AppBar>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StickerSection title="Built-in Stickers">
          <View style={styles.grid}>
            {builtInStickers.map((asset) => (
              <StickerCard key={asset.id} asset={asset} cardWidth={cardWidth} />
            ))}
          </View>
        </StickerSection>

        <StickerSection title="My Stickers">
          {isLoading ? (
            <View style={styles.emptyPanel}>
              <Text style={styles.emptyText}>스티커를 불러오는 중이에요.</Text>
            </View>
          ) : userStickers.length > 0 ? (
            <View style={styles.grid}>
              {userStickers.map((asset) => (
                <StickerCard
                  key={asset.id}
                  asset={asset}
                  cardWidth={cardWidth}
                  onDelete={handleDeleteUserSticker}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyPanel}>
              <Text style={styles.emptyText}>등록한 스티커가 없어요.</Text>
            </View>
          )}
        </StickerSection>

        {isSaving ? (
          <View style={styles.savingPanel}>
            <Text style={styles.savingText}>스티커를 저장하는 중이에요.</Text>
          </View>
        ) : null}
      </ScrollView>
    </AppSafeAreaView>
  );
}

function StickerSection(props: { children: ReactNode; title: string }) {
  const { children, title } = props;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function StickerCard(props: {
  asset: StickerAsset;
  cardWidth: number;
  onDelete?: (asset: UserStickerAsset) => void;
}) {
  const { asset, cardWidth, onDelete } = props;
  const title = asset.name ?? "Sticker";

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <View style={styles.preview}>
        {asset.source === "user" ? (
          <Image
            cachePolicy="none"
            contentFit="contain"
            source={{ uri: asset.imagePath }}
            style={styles.userStickerImage}
          />
        ) : (
          <BuiltInStickerPreview asset={asset} />
        )}
      </View>
      <View style={styles.cardFooter}>
        <Text numberOfLines={1} style={styles.cardTitle}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.cardSubtitle}>
          {asset.source === "builtIn" ? "기본 제공" : "사용자 등록"}
        </Text>
      </View>
      {asset.source === "user" && onDelete ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${title} 삭제`}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
          ]}
          onPress={() => onDelete(asset)}
        >
          <ReiconIcon
            color={appColors.white}
            name={TRASH_ICON}
            size={18}
            weight="Filled"
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function BuiltInStickerPreview(props: { asset: BuiltInStickerAsset }) {
  const { asset } = props;

  if (asset.variant === "calendar") {
    return (
      <View style={styles.calendarPreview}>
        <View style={styles.calendarPreviewHeader}>
          <Text style={styles.calendarPreviewMonth}>JUL</Text>
        </View>
        <View style={styles.calendarPreviewGrid}>
          {Array.from({ length: 21 }).map((_, index) => (
            <View
              key={index.toString()}
              style={[
                styles.calendarPreviewDot,
                index === 10 && styles.calendarPreviewActiveDot,
              ]}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.polaroidPreview}>
      <View style={styles.polaroidPhotoArea}>
        <ReiconIcon color="#6B9AE4" name="Image" size={34} weight="Filled" />
      </View>
      <View style={styles.polaroidCaption} />
    </View>
  );
}

function isBuiltInStickerAsset(
  asset: StickerAsset,
): asset is BuiltInStickerAsset {
  return asset.source === "builtIn";
}

function isUserStickerAsset(asset: StickerAsset): asset is UserStickerAsset {
  return asset.source === "user";
}

function getStickerCardWidth(windowWidth: number): number {
  const contentWidth = windowWidth - appSpacing.screenHorizontalPadding * 2;
  const columnCount = contentWidth >= 720 ? 4 : contentWidth >= 520 ? 3 : 2;
  const totalGap = CARD_GAP * (columnCount - 1);

  return Math.floor((contentWidth - totalGap) / columnCount);
}

const styles = StyleSheet.create({
  appBarActions: {
    flexDirection: "row",
    gap: 10,
  },
  content: {
    gap: 24,
    paddingBottom: appSpacing.screenContentBottomPadding,
    paddingHorizontal: appSpacing.screenHorizontalPadding,
    paddingTop: appSpacing.screenContentTopPadding,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  card: {
    backgroundColor: appColors.white,
    borderColor: "#ECEFF3",
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    position: "relative",
  },
  preview: {
    alignItems: "center",
    aspectRatio: 1,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    padding: 18,
  },
  userStickerImage: {
    height: "100%",
    width: "100%",
  },
  cardFooter: {
    gap: 2,
    padding: 12,
  },
  cardTitle: {
    color: appColors.black,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  cardSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  deleteButton: {
    alignItems: "center",
    backgroundColor: appColors.blackOverlay34,
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: 10,
    top: 10,
    width: 32,
  },
  deleteButtonPressed: {
    backgroundColor: appColors.black,
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
  calendarPreview: {
    backgroundColor: appColors.white,
    borderColor: "#121212",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 2,
    overflow: "hidden",
    width: "82%",
  },
  calendarPreviewHeader: {
    alignItems: "center",
    backgroundColor: "#F05BCF",
    paddingVertical: 8,
  },
  calendarPreviewMonth: {
    color: appColors.white,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18,
  },
  calendarPreviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    padding: 10,
  },
  calendarPreviewDot: {
    backgroundColor: "#D7DADF",
    borderRadius: 5,
    height: 8,
    width: 8,
  },
  calendarPreviewActiveDot: {
    backgroundColor: appColors.black,
  },
  polaroidPreview: {
    backgroundColor: appColors.white,
    borderColor: "#E1E4EA",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    boxShadow: "0 8px 18px rgba(18, 18, 18, 0.12)",
    padding: 8,
    transform: [{ rotate: "-5deg" }],
    width: "74%",
  },
  polaroidPhotoArea: {
    alignItems: "center",
    aspectRatio: 1,
    backgroundColor: "#DDEBFF",
    justifyContent: "center",
  },
  polaroidCaption: {
    alignSelf: "center",
    backgroundColor: "#D7DADF",
    borderRadius: 2,
    height: 5,
    marginTop: 10,
    width: "48%",
  },
});
