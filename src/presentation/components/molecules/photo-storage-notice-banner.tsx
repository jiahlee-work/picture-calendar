import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { appColors } from "@/presentation/theme/colors";

export function PhotoStorageNoticeBanner() {
  return (
    <View style={styles.banner}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.bannerArt}>
        <View style={[styles.photoCard, styles.backPhotoCard]} />
        <View style={[styles.photoCard, styles.frontPhotoCard]}>
          <SymbolView
            colors={[appColors.white]}
            name={{ ios: "photo", android: "image" }}
            size={27}
            tintColor={appColors.white}
            type="monochrome"
            weight="bold"
          />
        </View>
        <View style={styles.warningBadge}>
          <SymbolView
            colors={[appColors.white]}
            name={{ ios: "exclamationmark", android: "priority_high" }}
            size={15}
            tintColor={appColors.white}
            type="monochrome"
            weight="bold"
          />
        </View>
      </View>

      <View style={styles.bannerCopy}>
        <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.bannerTitle}>
          사진은 이 기기에 저장돼요
        </Text>
        <Text style={styles.bannerBody}>
          앱 캐시나 데이터를 삭제하면 캘린더에 등록한 사진이 사라져요.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: "center",
    backgroundColor: appColors.white,
    borderColor: "#F0F4F8",
    borderCurve: "continuous",
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: "0 10px 24px rgba(18, 18, 18, 0.08), inset 0 -74px 54px rgba(225, 241, 255, 0.64)",
    flexDirection: "row",
    gap: 10,
    minHeight: 140,
    overflow: "hidden",
    padding: 16,
  },
  bannerCopy: {
    flex: 1,
    gap: 10,
    minWidth: 0,
    zIndex: 1,
  },
  bannerTitle: {
    color: appColors.black,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 24,
  },
  bannerBody: {
    color: "#5F6670",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
  },
  bannerArt: {
    height: 96,
    justifyContent: "center",
    position: "relative",
    width: 88,
  },
  photoCard: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 18,
    height: 70,
    justifyContent: "center",
    position: "absolute",
    width: 52,
  },
  backPhotoCard: {
    backgroundColor: "#C7DCF4",
    left: 7,
    top: 13,
    transform: [{ rotate: "-12deg" }],
  },
  frontPhotoCard: {
    backgroundColor: "#6B9AE4",
    left: 25,
    top: 22,
    transform: [{ rotate: "10deg" }],
  },
  warningBadge: {
    alignItems: "center",
    backgroundColor: "#121212",
    borderColor: appColors.white,
    borderRadius: 16,
    borderWidth: 3,
    bottom: 9,
    height: 32,
    justifyContent: "center",
    left: 56,
    position: "absolute",
    width: 32,
  },
});
