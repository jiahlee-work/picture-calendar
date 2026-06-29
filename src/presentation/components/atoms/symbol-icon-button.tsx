import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Pressable, StyleSheet } from "react-native";

import { appColors } from "@/presentation/theme/colors";

type SymbolIconButtonProps = {
  accessibilityLabel: string;
  icon: SymbolViewProps["name"];
  isExpanded?: boolean;
  onPress: () => void;
};

export function SymbolIconButton(props: SymbolIconButtonProps) {
  const { accessibilityLabel, icon, isExpanded, onPress } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={isExpanded === undefined ? undefined : { expanded: isExpanded }}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
    >
      <SymbolView
        colors={[appColors.white]}
        name={icon}
        size={24}
        tintColor={appColors.white}
        type="monochrome"
        weight="bold"
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
