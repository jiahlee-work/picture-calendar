import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import type { DailyPhotoPolicyDialogState } from "@/application/hooks/useTodayPhotoFlow";
import { appColors } from "@/presentation/theme/colors";

type DailyPhotoPolicyDialogProps = {
  dialog?: DailyPhotoPolicyDialogState;
  onCancel: () => void;
};

export function DailyPhotoPolicyDialog(props: DailyPhotoPolicyDialogProps) {
  const { dialog, onCancel } = props;

  if (!dialog || dialog.type === "none") {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible onRequestClose={onCancel}>
      <Pressable accessibilityLabel="안내 닫기" style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{dialog.title}</Text>
          <Text style={styles.message}>{dialog.message}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.primaryButton} onPress={onCancel}>
              <Text style={styles.primaryButtonText}>확인</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: appColors.blackOverlay26,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: appColors.background,
    borderRadius: 24,
    padding: 20,
    width: "100%",
  },
  title: {
    color: appColors.black,
    fontSize: 18,
    fontWeight: "900",
  },
  message: {
    color: "#555555",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 18,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: appColors.black,
    borderRadius: 16,
    minWidth: 72,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
});
