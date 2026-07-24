import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";

import { appLayers } from "@/presentation/theme/layers";

export function AppBottomSheetBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.35}
      pressBehavior="close"
      style={[props.style, styles.backdrop]}
    />
  );
}

const styles = StyleSheet.create({
  backdrop: {
    elevation: appLayers.bottomSheet,
    zIndex: appLayers.bottomSheet,
  },
});
