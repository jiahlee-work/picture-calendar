import { StyleSheet } from "react-native";
import {
  SafeAreaView,
  type SafeAreaViewProps,
} from "react-native-safe-area-context";

import { appColors } from "@/presentation/theme/colors";

type AppSafeAreaViewVariant = "screen" | "overlay" | "inset";

type AppSafeAreaViewProps = SafeAreaViewProps & {
  variant?: AppSafeAreaViewVariant;
};

export function AppSafeAreaView(props: AppSafeAreaViewProps) {
  const { style, variant = "screen", ...safeAreaProps } = props;

  return <SafeAreaView {...safeAreaProps} style={[styles[variant], style]} />;
}

const styles = StyleSheet.create({
  inset: {},
  overlay: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 20,
  },
  screen: {
    backgroundColor: appColors.background,
    flex: 1,
  },
});
