import { Alert } from "react-native";

import { translate } from "@/application/services/localization/app-i18n";

export function showCaptureNotReadyAlert() {
  Alert.alert(
    translate("sharing.notReadyTitle"),
    translate("sharing.notReadyMessage"),
  );
}
