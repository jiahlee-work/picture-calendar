import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { CalendarWheelPickerSelector } from "@/presentation/components/organisms/calendar-wheel-picker-selector";
import { appColors } from "@/presentation/theme/colors";
import { dayjs } from "@/shared/date/dayjs";

type CalendarWheelPickerSelectorStoryArgs = React.ComponentProps<
  typeof CalendarWheelPickerSelector
>;

const meta = {
  component: CalendarWheelPickerSelector,
  decorators: [
    (Story) => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  title: "Components/Organisms/Calendar Wheel Picker Selector",
} satisfies Meta<CalendarWheelPickerSelectorStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: dayjs("2026-07-01").toDate(),
    onCancel: () => undefined,
    onConfirm: () => undefined,
  },
  render: ({ value }) => <CalendarWheelPickerSelectorStoryView value={value} />,
};

function CalendarWheelPickerSelectorStoryView(
  props: Pick<CalendarWheelPickerSelectorStoryArgs, "value">,
) {
  const { value } = props;
  const [selectedDate, setSelectedDate] = useState(value);

  return (
    <View style={styles.storySurface}>
      <Text style={styles.selectedLabel}>
        {dayjs(selectedDate).format("YYYY년 M월")}
      </Text>
      <CalendarWheelPickerSelector
        value={selectedDate}
        onCancel={() => undefined}
        onConfirm={setSelectedDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    backgroundColor: appColors.white,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  selectedLabel: {
    color: appColors.black,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 32,
    textAlign: "center",
  },
  storySurface: {
    gap: 20,
    maxWidth: 430,
    width: "100%",
  },
});
