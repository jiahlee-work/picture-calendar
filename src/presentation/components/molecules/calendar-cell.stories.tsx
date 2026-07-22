import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import type { CalendarDay } from "@/application/services/calendar/calendar-grid";
import { CalendarCell } from "@/presentation/components/molecules/calendar-cell";
import { createDailyPhotoFixture } from "@/presentation/storybook/photo-fixtures";

const photoDay: CalendarDay = {
  date: new Date(2026, 6, 22),
  dayOfMonth: 22,
  isToday: false,
  key: "2026-07-22",
  photo: createDailyPhotoFixture("calendar-cell-photo", "2026-07-22"),
};

type CalendarCellStoryPreviewProps = {
  hasPhoto: boolean;
  isToday: boolean;
};

function CalendarCellStoryPreview(props: CalendarCellStoryPreviewProps) {
  const { hasPhoto, isToday } = props;

  return (
    <CalendarCell
      cellHeight={132}
      cellWidth={72}
      day={{
        ...photoDay,
        isToday,
        photo: hasPhoto ? photoDay.photo : null,
      }}
      onPressDate={() => undefined}
    />
  );
}

const meta = {
  component: CalendarCellStoryPreview,
  decorators: [
    (Story) => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    hasPhoto: {
      control: {
        labels: ["true", "false"],
        type: "radio",
      },
      options: [true, false],
    },
    isToday: {
      control: {
        labels: ["true", "false"],
        type: "radio",
      },
      options: [true, false],
    },
  },
  title: "Components/Molecules/Calendar Cell",
} satisfies Meta<CalendarCellStoryPreviewProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    hasPhoto: true,
    isToday: false,
  },
};

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
