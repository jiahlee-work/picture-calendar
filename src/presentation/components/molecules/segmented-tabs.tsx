import { Pressable, StyleSheet, Text, View } from "react-native";

import { appColors } from "@/presentation/theme/colors";

export type SegmentedTabOption<Value extends string> = {
  label: string;
  value: Value;
};

type SegmentedTabsProps<Value extends string> = {
  options: readonly SegmentedTabOption<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
};

export function SegmentedTabs<Value extends string>(
  props: SegmentedTabsProps<Value>,
) {
  const { options, value, onValueChange } = props;

  return (
    <View accessibilityRole="tablist" style={styles.root}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isSelected }}
            key={option.value}
            style={({ pressed }) => [
              styles.tab,
              isSelected ? styles.activeTab : styles.inactiveTab,
              pressed && styles.pressedTab,
            ]}
            onPress={() => onValueChange(option.value)}
          >
            <Text
              style={[
                styles.tabText,
                isSelected ? styles.activeTabText : styles.inactiveTabText,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: appColors.black,
    borderColor: appColors.black,
    borderWidth: 1,
  },
  activeTabText: {
    color: appColors.white,
  },
  inactiveTab: {
    backgroundColor: appColors.white,
    borderColor: "#E8E8E8",
    borderWidth: StyleSheet.hairlineWidth,
  },
  inactiveTabText: {
    color: "#8A8A8A",
  },
  pressedTab: {
    opacity: 0.72,
  },
  root: {
    flexDirection: "row",
    gap: 12,
  },
  tab: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 40,
    minWidth: 68,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
