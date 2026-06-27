import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Pressable, StyleSheet, Text } from "react-native";

import { appColors } from "@/presentation/theme/colors";

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
        colors={[appColors.black]}
        name={icon}
        size={20}
        tintColor={appColors.black}
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
    color: appColors.black,
    fontSize: 15,
    fontWeight: "800",
  },
});
