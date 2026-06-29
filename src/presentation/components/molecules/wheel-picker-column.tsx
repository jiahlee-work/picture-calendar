import WheelPicker from "@quidone/react-native-wheel-picker";
import { StyleSheet, Text, View } from "react-native";

import { WheelPickerGestureScrollList, type WheelPickerOption } from "@/presentation/components/molecules/wheel-picker-gesture-scroll-list";
import { appColors } from "@/presentation/theme/colors";

type WheelPickerColumnProps = {
  options: WheelPickerOption[];
  selectedValue: number;
  onValueChange: (value: number) => void;
};

export const wheelPickerItemHeight = 52;
export const wheelPickerVisibleItemCount = 5;
export const wheelPickerHeight = wheelPickerItemHeight * wheelPickerVisibleItemCount;
export const wheelPickerSpacerHeight = (wheelPickerHeight - wheelPickerItemHeight) / 2;

export function WheelPickerColumn(props: WheelPickerColumnProps) {
  const { onValueChange, options, selectedValue } = props;

  return (
    <WheelPicker
      data={options}
      enableScrollByTapOnItem
      extraValues={[selectedValue]}
      itemHeight={wheelPickerItemHeight}
      keyExtractor={(item) => String(item.value)}
      renderItem={({ item }) => (
        <View style={styles.option}>
          <Text style={[styles.optionText, item.value === selectedValue && styles.selectedOptionText]}>
            {item.label}
          </Text>
        </View>
      )}
      renderList={(listProps) => <WheelPickerGestureScrollList {...listProps} />}
      renderOverlay={() => null}
      style={styles.optionColumn}
      value={selectedValue}
      visibleItemCount={wheelPickerVisibleItemCount}
      width="100%"
      onValueChanged={({ item }) => onValueChange(item.value)}
      onValueChanging={({ item }) => onValueChange(item.value)}
    />
  );
}

const styles = StyleSheet.create({
  optionColumn: {
    flex: 1,
  },
  option: {
    alignItems: "center",
    height: wheelPickerItemHeight,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  optionText: {
    color: "#b4b4b4",
    fontSize: 23,
    fontWeight: "700",
    lineHeight: 31,
  },
  selectedOptionText: {
    color: appColors.black,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 38,
  },
});
