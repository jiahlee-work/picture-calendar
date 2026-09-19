import { Pressable, StyleSheet, View } from "react-native";

import { AppText as Text } from "@/presentation/components/atoms/app-text";
import {
  ReiconIcon,
  type ReiconName,
} from "@/presentation/components/atoms/reicon-icon";

import { appColors } from "@/presentation/theme/colors";

export type SegmentedTabOption<Value extends string> = {
  icon?: ReiconName;
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
            {option.icon ? (
              <ReiconIcon
                color={isSelected ? appColors.white : appColors.black}
                name={option.icon}
                size={20}
              />
            ) : null}
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
    color: appColors.black,
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
    flexDirection: "row",
    gap: 8,
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
