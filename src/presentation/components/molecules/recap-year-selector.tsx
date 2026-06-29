import { useEffect, useRef, useState } from "react";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import type { RecapYearOption } from "@/application/services/recap/recap-month-list";
import { appColors } from "@/presentation/theme/colors";

const chevronDownIcon: SymbolViewProps["name"] = { ios: "chevron.down", android: "keyboard_arrow_down" };
const chevronUpIcon: SymbolViewProps["name"] = { ios: "chevron.up", android: "keyboard_arrow_up" };

type RecapYearSelectorProps = {
  onSelectYear: (year: number) => void;
  options: RecapYearOption[];
  selectedYear: number;
};

export function RecapYearSelector(props: RecapYearSelectorProps) {
  const { onSelectYear, options, selectedYear } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const openProgress = useRef(new Animated.Value(0)).current;
  const selectedOption = options.find((option) => option.year === selectedYear) ?? options[0];

  useEffect(() => {
    if (isOpen) {
      setIsMenuMounted(true);
      Animated.timing(openProgress, {
        duration: 140,
        toValue: 1,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(openProgress, {
      duration: 110,
      toValue: 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsMenuMounted(false);
      }
    });
  }, [isOpen, openProgress]);

  const handleToggleOpen = () => {
    setIsOpen((current) => !current);
  };

  const handleSelectYear = (year: number) => {
    onSelectYear(year);
    setIsOpen(false);
  };

  const menuAnimatedStyle = {
    opacity: openProgress,
    transform: [
      {
        translateY: openProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [-4, 0],
        }),
      },
      {
        scale: openProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.98, 1],
        }),
      },
    ],
  };

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="리캡 연도 선택"
        accessibilityState={{ expanded: isOpen }}
        style={styles.trigger}
        onPress={handleToggleOpen}
      >
        <Text style={styles.triggerText}>{selectedOption?.label ?? String(selectedYear)}</Text>
        <SymbolView
          colors={["#6f6f6f"]}
          name={isOpen ? chevronUpIcon : chevronDownIcon}
          size={16}
          tintColor="#6f6f6f"
          type="monochrome"
          weight="bold"
        />
      </Pressable>

      {isMenuMounted && (
        <Animated.View style={[styles.menu, menuAnimatedStyle]}>
          {options.map((option) => {
            const isSelected = option.year === selectedYear;

            return (
              <Pressable key={option.year} style={styles.menuItem} onPress={() => handleSelectYear(option.year)}>
                <Text style={[styles.menuItemText, isSelected && styles.selectedMenuItemText]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    zIndex: 8,
  },
  trigger: {
    alignItems: "center",
    backgroundColor: "#eeeeee",
    borderColor: "#d7d7d7",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 34,
    minWidth: 88,
    paddingLeft: 14,
    paddingRight: 14,
  },
  triggerText: {
    color: "#3f3f3f",
    fontSize: 15,
    fontWeight: "800",
  },
  menu: {
    backgroundColor: appColors.background,
    borderColor: "#d7d7d7",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    minWidth: 88,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    shadowColor: appColors.black,
    shadowOffset: {
      height: 8,
      width: 0,
    },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    top: 40,
    zIndex: 9,
  },
  menuItem: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  menuItemText: {
    color: "#4a4a4a",
    fontSize: 15,
    fontWeight: "700",
  },
  selectedMenuItemText: {
    color: appColors.black,
    fontWeight: "900",
  },
});
