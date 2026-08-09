import { Alert } from "react-native";

export function showCaptureNotReadyAlert() {
  Alert.alert(
    "공유할 수 없음",
    "이미지를 만들 콘텐츠가 아직 준비되지 않았어요.",
  );
}
