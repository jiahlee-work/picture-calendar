import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Pressable, StyleSheet } from "react-native";

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
        colors={["#222222"]}
        name={icon}
        size={24}
        tintColor="#222222"
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
