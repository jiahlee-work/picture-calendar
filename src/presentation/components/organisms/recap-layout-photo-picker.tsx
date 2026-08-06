import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import type { DailyPhoto } from "@/application/services/daily-photo/types";
import { SelectionCheckbox } from "@/presentation/components/atoms/selection-checkbox";

type RecapLayoutPhotoPickerProps = {
  onSelectPhoto: (photoId: string | null) => void;
  photos: DailyPhoto[];
  selectedPhotoId: string | null;
  visible: boolean;
};

export function RecapLayoutPhotoPicker(props: RecapLayoutPhotoPickerProps) {
  const { onSelectPhoto, photos, selectedPhotoId, visible } = props;

  if (!visible || photos.length === 0) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.content}
        showsHorizontalScrollIndicator={false}
      >
        {photos.map((photo) => {
          const isSelected = photo.id === selectedPhotoId;
          const nextPhotoId = isSelected ? null : photo.id;

          return (
            <Pressable
              key={photo.id}
              accessibilityRole="button"
              accessibilityLabel="레이아웃 사진 선택"
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.thumbnailButton,
                pressed && styles.thumbnailButtonPressed,
              ]}
              onPress={() => onSelectPhoto(nextPhotoId)}
            >
              <Image
                cachePolicy="none"
                contentFit="cover"
                source={{ uri: photo.imagePath }}
                style={styles.thumbnail}
              />
              <SelectionCheckbox
                accessibilityLabel="선택한 레이아웃 사진"
                isSelected={isSelected}
                size={24}
                style={styles.selectionControl}
                onPress={() => onSelectPhoto(nextPhotoId)}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    bottom: 96,
    left: 0,
    position: "absolute",
    right: 0,
  },
  content: {
    gap: 10,
    paddingHorizontal: 20,
  },
  thumbnail: {
    borderRadius: 10,
    height: "100%",
    overflow: "hidden",
    width: "100%",
  },
  thumbnailButton: {
    borderRadius: 14,
    height: 68,
    overflow: "hidden",
    width: 68,
  },
  thumbnailButtonPressed: {
    opacity: 0.62,
  },
  selectionControl: {
    position: "absolute",
    right: 4,
    top: 4,
  },
});
