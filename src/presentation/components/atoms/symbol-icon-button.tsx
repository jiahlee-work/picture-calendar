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
        colors={[appColors.black]}
        name={icon}
        size={24}
        tintColor={appColors.black}
        type="monochrome"
        weight="bold"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#eeeeee",
    borderRadius: 18,
    height: 38,
    justifyContent: "center",
    width: 48,
  },
  buttonPressed: {
    backgroundColor: "#e2e2e2",
  },
});
