import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Pressable, StyleSheet, Text } from "react-native";

export type AppMenuItemProps = {
  icon: SymbolViewProps["name"];
  label: string;
  onPress: () => void;
};

export function AppMenuItem(props: AppMenuItemProps) {
  const { icon, label, onPress } = props;

  return (
    <Pressable accessibilityRole="menuitem" style={({ pressed }) => [styles.item, pressed && styles.itemPressed]} onPress={onPress}>
      <SymbolView
        colors={["#202020"]}
        name={icon}
        size={20}
        tintColor="#202020"
        type="monochrome"
        weight="semibold"
      />
      <Text style={styles.itemText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  itemPressed: {
    backgroundColor: "#f4f4f4",
  },
  itemText: {
    color: "#202020",
    fontSize: 15,
    fontWeight: "800",
  },
});
