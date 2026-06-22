import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import type { DialogState } from "@/application/hooks/useTodayPhotoFlow";

type DailyPhotoDialogProps = {
  dialog: DialogState;
  onCancel: () => void;
};

export function DailyPhotoDialog(props: DailyPhotoDialogProps) {
  const { dialog, onCancel } = props;

  if (dialog.type === "none") {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{dialog.title}</Text>
          <Text style={styles.message}>{dialog.message}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.primaryButton} onPress={onCancel}>
              <Text style={styles.primaryButtonText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.26)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    width: "100%",
  },
  title: {
    color: "#111111",
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
    backgroundColor: "#202020",
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
