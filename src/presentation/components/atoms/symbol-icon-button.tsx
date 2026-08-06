import { Pressable, StyleSheet } from "react-native";

import {
  ReiconIcon,
  type ReiconName,
} from "@/presentation/components/atoms/reicon-icon";
import { appColors } from "@/presentation/theme/colors";

type SymbolIconButtonProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: ReiconName;
  isExpanded?: boolean;
  onPress: () => void;
};

export function SymbolIconButton(props: SymbolIconButtonProps) {
  const {
    accessibilityLabel,
    disabled = false,
    icon,
    isExpanded,
    onPress,
  } = props;
  const accessibilityState = {
    ...(isExpanded === undefined ? {} : { expanded: isExpanded }),
    ...(disabled ? { disabled: true } : {}),
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={
        Object.keys(accessibilityState).length > 0
          ? accessibilityState
          : undefined
      }
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <ReiconIcon color={appColors.white} name={icon} size={24} />
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
  buttonDisabled: {
    opacity: 0.38,
  },
});
