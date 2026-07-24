import { Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { appColors } from "@/presentation/theme/colors";

type MediaLibraryPermissionAlertProps = {
  canAskAgain: boolean;
  visible: boolean;
  onClose: () => void;
};

export function MediaLibraryPermissionAlert(props: MediaLibraryPermissionAlertProps) {
  const { canAskAgain, onClose, visible } = props;

  if (!visible) {
    return null;
  }

  const handleOpenSettings = () => {
    onClose();
    void Linking.openSettings();
  };

  return (
    <Modal animationType="fade" transparent visible onRequestClose={onClose}>
      <Pressable accessibilityLabel="저장 권한 안내 닫기" style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>저장 권한 필요</Text>
          <Text style={styles.message}>{toPermissionMessage(canAskAgain)}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>확인</Text>
            </Pressable>
            {!canAskAgain ? (
              <Pressable style={styles.primaryButton} onPress={handleOpenSettings}>
                <Text style={styles.primaryButtonText}>설정 열기</Text>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function toPermissionMessage(canAskAgain: boolean) {
  if (canAskAgain) {
    return "이미지를 갤러리에 저장하려면 사진 저장 권한이 필요해요.";
  }

  return "사진 저장 권한이 꺼져 있어 이미지를 저장할 수 없어요. 설정에서 권한을 허용해 주세요.";
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
    minWidth: 92,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#eeeeee",
    borderRadius: 16,
    minWidth: 72,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: appColors.black,
    fontSize: 14,
    fontWeight: "800",
  },
});
