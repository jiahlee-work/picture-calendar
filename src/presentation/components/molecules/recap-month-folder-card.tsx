import { Link } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import type { RecapMonthSummary } from "@/application/services/recap/recap-month-list";
import { PhotoPreviewCard } from "@/presentation/components/atoms/photo-preview-card";
import { appColors } from "@/presentation/theme/colors";

const folderBackColor = "rgba(231, 236, 234, 0.58)";
const folderFrontColor = "rgba(255, 255, 255, 0.84)";
const androidFolderFrontColor = "rgba(255, 255, 255, 0.72)";

const previewSlots = [
  {
    left: 15,
    rotate: "-8deg",
    top: 34,
    zIndex: 1,
  },
  {
    left: 58,
    rotate: "4deg",
    top: 12,
    zIndex: 3,
  },
  {
    left: 101,
    rotate: "7deg",
    top: 32,
    zIndex: 2,
  },
  {
    left: 44,
    rotate: "-2deg",
    top: 50,
    zIndex: 4,
  },
] as const;

type RecapMonthFolderCardProps = {
  month: RecapMonthSummary;
};

export function RecapMonthFolderCard(props: RecapMonthFolderCardProps) {
  const { month } = props;
  const isDisabled = month.status === "disabled";
  const href = toRecapMonthHref(month);
  const card = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${month.monthLabel} recap`}
      accessibilityState={isDisabled ? { disabled: true } : undefined}
      disabled={isDisabled}
      style={styles.card}
    >
      <View style={styles.folder}>
        <View pointerEvents="none" style={[styles.folderBack, isDisabled && styles.disabledFolderBack]}>
          <View style={[styles.backTabLeft, isDisabled && styles.disabledFolderBack]} />
          <View style={[styles.backTabSlope, isDisabled && styles.disabledFolderBack]} />
        </View>
        {!isDisabled && (
          <View pointerEvents="none" style={styles.previewStack}>
            {month.previewPhotos.slice(0, previewSlots.length).map((photo, index) => {
              const slot = previewSlots[index];

              return (
                <PhotoPreviewCard
                  key={`${month.month}-${photo.id}`}
                  photo={photo}
                  style={{
                    left: slot.left,
                    top: slot.top,
                    transform: [{ rotate: slot.rotate }],
                    zIndex: slot.zIndex,
                  }}
                />
              );
            })}
          </View>
        )}
        <View pointerEvents="none" style={[styles.frontPerspective, isDisabled && styles.closedFrontPerspective]}>
          <View style={[styles.folderFront, isDisabled && styles.closedFolderFront]}>
            <View style={styles.frontContent}>
              <Text style={[styles.monthName, isDisabled && styles.disabledText]}>{month.monthLabel}</Text>
              <Text style={[styles.countText, isDisabled && styles.disabledText]}>{month.photoCount} photos</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );

  if (isDisabled) {
    return card;
  }

  return (
    <Link href={href} asChild>
      {card}
    </Link>
  );
}

function toRecapMonthHref(month: RecapMonthSummary) {
  if (month.status === "needs_selection") {
    return {
      params: {
        month: month.month,
      },
      pathname: "/recap/select" as const,
    };
  }

  return {
    params: {
      month: month.monthNumber,
      year: String(month.year),
    },
    pathname: "/recap/[year]/[month]" as const,
  };
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    marginBottom: 28,
    paddingHorizontal: 4,
    width: "50%",
  },
  folder: {
    height: 150,
    position: "relative",
    width: 172,
  },
  folderBack: {
    backgroundColor: folderBackColor,
    borderRadius: 14,
    height: 58,
    left: 12,
    position: "absolute",
    top: 27,
    width: 148,
    zIndex: 1,
  },
  disabledFolderBack: {
    backgroundColor: "rgba(224, 224, 224, 0.84)",
  },
  backTabLeft: {
    backgroundColor: folderBackColor,
    borderTopLeftRadius: 14,
    height: 24,
    left: 0,
    position: "absolute",
    top: -12,
    width: 64,
  },
  backTabSlope: {
    backgroundColor: folderBackColor,
    borderTopRightRadius: 10,
    height: 22,
    left: 52,
    position: "absolute",
    top: -7,
    transform: [{ rotate: "26deg" }],
    width: 32,
  },
  frontPerspective: {
    bottom: -4,
    height: 75,
    left: 1,
    position: "absolute",
    shadowColor: appColors.black,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: Platform.OS === "android" ? 0 : 0.08,
    shadowRadius: 14,
    transform: Platform.select({
      android: [{ perspective: 700 }, { rotateX: "-8deg" }],
      default: [{ perspective: 550 }, { rotateX: "-14deg" }],
    }),
    width: 170,
    zIndex: 5,
  },
  folderFront: {
    backgroundColor: Platform.OS === "android" ? androidFolderFrontColor : folderFrontColor,
    borderRadius: 14,
    bottom: -4,
    elevation: 0,
    height: 116,
    left: 0,
    position: "absolute",
    width: 170,
    zIndex: 10,
    overflow: 'hidden',
  },
  closedFrontPerspective: {
    bottom: 0,
    transform: [{ perspective: 550 }, { rotateX: "0deg" }],
  },
  closedFolderFront: {
    backgroundColor: "rgba(232, 232, 232, 0.96)",
    bottom: 0,
    height: 92,
  },
  frontContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16
  },
  previewStack: {
    height: 120,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    top: -4,
    zIndex: 2,
  },
  monthName: {
    color: appColors.black,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 12,
    textAlign: "left",
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
    textAlign: "right",
  },
  disabledText: {
    color: "#9a9a9a",
  },
});
