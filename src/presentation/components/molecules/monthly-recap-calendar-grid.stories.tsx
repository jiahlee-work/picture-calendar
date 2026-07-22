import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { buildCalendarMonth } from "@/application/services/calendar/calendar-grid";
import { MonthlyRecapCalendarGrid } from "@/presentation/components/molecules/monthly-recap-calendar-grid";
import { dayjs } from "@/shared/date/dayjs";

const julyCalendar = buildCalendarMonth(
  new Date(2026, 6, 1),
  new Date(2026, 6, 22),
);

const meta = {
  component: MonthlyRecapCalendarGrid,
  decorators: [
    (Story) => (
      <View style={styles.card}>
        <Story />
      </View>
    ),
  ],
  title: "Components/Molecules/Monthly Recap Calendar Grid",
} satisfies Meta<typeof MonthlyRecapCalendarGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const July2026: Story = {
  args: {
    cells: julyCalendar.days,
    monthDate: dayjs("2026-07-01"),
  },
};

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    height: 460,
    maxWidth: 340,
    paddingBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 28,
    width: "100%",
  },
});
