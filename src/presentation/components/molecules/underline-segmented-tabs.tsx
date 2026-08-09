import { Pressable, StyleSheet, Text, View } from "react-native";

import { appColors } from "@/presentation/theme/colors";

export type UnderlineSegmentedTabOption<Value extends string> = {
  label: string;
  value: Value;
};

type UnderlineSegmentedTabsProps<Value extends string> = {
  options: readonly UnderlineSegmentedTabOption<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
};

export function UnderlineSegmentedTabs<Value extends string>(
  props: UnderlineSegmentedTabsProps<Value>,
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
              isSelected && styles.selectedTab,
              pressed && styles.pressedTab,
            ]}
            onPress={() => onValueChange(option.value)}
          >
            <Text
              style={[
                styles.tabText,
                isSelected ? styles.selectedTabText : styles.inactiveTabText,
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
  inactiveTabText: {
    color: appColors.blackOverlay34,
  },
  pressedTab: {
    opacity: 0.72,
  },
  root: {
    borderBottomColor: "rgba(18,18,18,0.08)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
  },
  selectedTab: {
    borderBottomColor: appColors.black,
  },
  selectedTabText: {
    color: appColors.black,
  },
  tab: {
    alignItems: "center",
    borderBottomColor: "transparent",
    borderBottomWidth: 3,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabText: {
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
});
