import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { MonthlyCalendar } from "@/presentation/components/organisms/monthly-calendar";
import {
  createEmptyStorybookCalendarMonth,
  createStorybookCalendarMonth,
  selectedStorybookDateKeys,
} from "@/presentation/storybook/calendar-fixtures";

const meta = {
  component: MonthlyCalendar,
  decorators: [
    (Story) => (
      <View style={styles.phoneFrame}>
        <Story />
      </View>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  title: "Components/Organisms/Monthly Calendar",
} satisfies Meta<typeof MonthlyCalendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Populated: Story = {
  args: {
    calendar: createStorybookCalendarMonth(),
    canSwipeMonth: false,
    contentWidth: 390,
    onSelectDate: () => undefined,
  },
};

export const SelectionMode: Story = {
  args: {
    ...Populated.args,
    selectedDateKeys: selectedStorybookDateKeys,
  },
};

export const WithoutPhotos: Story = {
  args: {
    ...Populated.args,
    calendar: createEmptyStorybookCalendarMonth(),
  },
};

const styles = StyleSheet.create({
  phoneFrame: {
    alignSelf: "center",
    height: 760,
    maxWidth: 430,
    width: "100%",
  },
});
