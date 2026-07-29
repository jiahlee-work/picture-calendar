import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { getCalendarRecapBackgroundPhotoCount } from "@/application/services/recap/monthly-recap-layout";
import { MonthlyRecapBackgroundCollage } from "@/presentation/components/molecules/monthly-recap-background-collage";
import { monthlyRecapPhotoFixtures } from "@/presentation/storybook/fixtures/recap-fixtures";

type CalendarRecapBackgroundCollageStoryArgs = {
  calendarRecapPhotoCount: "4" | "5" | "6" | "7" | "8" | "9" | "10";
};

const PHOTO_COUNT_OPTIONS = ["4", "5", "6", "7", "8", "9", "10"];
const PHOTO_COUNT_LABELS = {
  "4": "4 total / bg 1 / calendar 3",
  "5": "5 total / bg 1 / calendar 4",
  "6": "6 total / bg 1 / calendar 5",
  "7": "7 total / bg 4 / calendar 3",
  "8": "8 total / bg 4 / calendar 4",
  "9": "9 total / bg 4 / calendar 5",
  "10": "10 total / bg 4 / calendar 6",
};

function CalendarRecapBackgroundCollageStoryPreview(
  props: CalendarRecapBackgroundCollageStoryArgs,
) {
  const { calendarRecapPhotoCount } = props;
  const backgroundPhotoCount = getCalendarRecapBackgroundPhotoCount(
    Number(calendarRecapPhotoCount),
  );

  return (
    <MonthlyRecapBackgroundCollage
      photos={monthlyRecapPhotoFixtures.slice(0, backgroundPhotoCount)}
    />
  );
}

const meta = {
  component: CalendarRecapBackgroundCollageStoryPreview,
  decorators: [
    (Story) => (
      <View style={styles.frame}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    calendarRecapPhotoCount: {
      control: {
        labels: PHOTO_COUNT_LABELS,
        type: "select",
      },
      options: PHOTO_COUNT_OPTIONS,
    },
  },
  title: "Components/Molecules/Calendar Recap Background Collage",
} satisfies Meta<CalendarRecapBackgroundCollageStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    calendarRecapPhotoCount: "10",
  },
};

const styles = StyleSheet.create({
  frame: {
    alignSelf: "center",
    height: 640,
    maxWidth: 390,
    overflow: "hidden",
    width: "100%",
  },
});
