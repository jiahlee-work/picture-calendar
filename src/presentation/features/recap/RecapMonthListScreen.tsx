import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRecapMonthList, type RecapMonthSummary } from "@/application/hooks/useRecapMonthList";
import { AppMenuButton } from "@/presentation/components/organisms/app-menu-button";
import type { DailyPhoto } from "@/shared/daily-photo/types";

const previewSlots = [
  {
    left: 6,
    rotate: "-8deg",
    top: 20,
    zIndex: 1,
  },
  {
    left: 44,
    rotate: "4deg",
    top: 0,
    zIndex: 3,
  },
  {
    left: 82,
    rotate: "9deg",
    top: 28,
    zIndex: 2,
  },
  {
    left: 26,
    rotate: "-2deg",
    top: 48,
    zIndex: 4,
  },
] as const;

export function RecapMonthListScreen() {
  const { months, year } = useRecapMonthList();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <View>
          <Text style={styles.title}>Recap</Text>
          <Text style={styles.year}>{year}</Text>
        </View>
        <AppMenuButton />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {months.map((month) => (
            <RecapMonthFolderCard key={month.month} month={month} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RecapMonthFolderCard(props: { month: RecapMonthSummary }) {
  const { month } = props;

  return (
    <View style={styles.card}>
      <View style={styles.folderScene}>
        <View style={styles.folderBack} />
        <View style={styles.folderTab} />
        <View style={styles.previewStack}>
          {previewSlots.map((slot, index) => (
            <PhotoPreviewCard
              key={`${month.month}-${index}`}
              photo={month.previewPhotos[index]}
              style={{
                left: slot.left,
                top: slot.top,
                transform: [{ rotate: slot.rotate }],
                zIndex: slot.zIndex,
              }}
            />
          ))}
        </View>
        <View style={styles.folderFront}>
          <View style={styles.folderFrontHighlight} />
        </View>
      </View>

      <Text style={styles.monthName}>{month.monthLabel}</Text>
      <View style={styles.countPill}>
        <Text style={styles.countText}>{month.photoCount} photos</Text>
      </View>
    </View>
  );
}

function PhotoPreviewCard(props: {
  photo?: DailyPhoto;
  style: {
    left: number;
    top: number;
    transform: { rotate: string }[];
    zIndex: number;
  };
}) {
  const { photo, style } = props;

  return (
    <View style={[styles.photoCard, style]}>
      {photo ? (
        <Image cachePolicy="none" contentFit="cover" source={{ uri: photo.imagePath }} style={styles.photoImage} />
      ) : (
        <View style={styles.emptyPhoto} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#ffffff",
    flex: 1,
  },
  appBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    color: "#202020",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40,
  },
  year: {
    color: "#8f8f8f",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  content: {
    paddingBottom: 36,
    paddingHorizontal: 12,
    paddingTop: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  card: {
    alignItems: "center",
    marginBottom: 28,
    paddingHorizontal: 4,
    width: "50%",
  },
  folderScene: {
    height: 150,
    position: "relative",
    width: 156,
  },
  folderBack: {
    backgroundColor: "#eef3f1",
    borderColor: "#dfe7e4",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: 22,
    height: 96,
    left: 14,
    position: "absolute",
    right: 12,
    shadowColor: "#000000",
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  folderTab: {
    backgroundColor: "#e6efec",
    borderColor: "#dbe5e1",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    height: 34,
    position: "absolute",
    right: 26,
    top: 42,
    width: 74,
  },
  previewStack: {
    height: 112,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  photoCard: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 4,
    height: 84,
    overflow: "hidden",
    position: "absolute",
    shadowColor: "#000000",
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    width: 54,
    elevation: 3,
  },
  photoImage: {
    height: "100%",
    width: "100%",
  },
  emptyPhoto: {
    backgroundColor: "#f2f4f3",
    height: "100%",
    width: "100%",
  },
  folderFront: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderColor: "#e6e6e6",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    height: 86,
    left: 4,
    overflow: "hidden",
    position: "absolute",
    right: 4,
    shadowColor: "#000000",
    shadowOffset: {
      height: 8,
      width: 0,
    },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    zIndex: 5,
    elevation: 4,
  },
  folderFrontHighlight: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderRadius: 999,
    height: 54,
    left: 18,
    position: "absolute",
    right: 18,
    top: 10,
  },
  monthName: {
    color: "#242424",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 12,
    textAlign: "center",
  },
  countPill: {
    backgroundColor: "#f1f1f1",
    borderRadius: 999,
    marginTop: 5,
    minHeight: 24,
    minWidth: 76,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    color: "#a0a0a0",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
