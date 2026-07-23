import { Pressable, StyleSheet } from "react-native";

import {
  ReiconIcon,
  type ReiconName,
} from "@/presentation/components/atoms/reicon-icon";
import { appColors } from "@/presentation/theme/colors";

type SymbolIconButtonProps = {
  accessibilityLabel: string;
  icon: ReiconName;
  isExpanded?: boolean;
  onPress: () => void;
};

export function SymbolIconButton(props: SymbolIconButtonProps) {
  const { accessibilityLabel, icon, isExpanded, onPress } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={
        isExpanded === undefined ? undefined : { expanded: isExpanded }
      }
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
    >
      <ReiconIcon
        color={appColors.white}
        name={icon}
        size={24}
        weight="Filled"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: appColors.blackOverlay26,
    borderRadius: 20,
    flexShrink: 0,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  buttonPressed: {
    backgroundColor: appColors.blackOverlay34,
  },
});
