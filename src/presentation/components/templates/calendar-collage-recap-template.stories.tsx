import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { createCalendarRecapPhotoLayout } from "@/application/services/recap/monthly-recap-layout";
import { CalendarCollageRecapTemplate } from "@/presentation/components/templates/calendar-collage-recap-template";
import {
  calendarCollageRecapFixture,
  monthlyRecapPhotoFixtures,
} from "@/presentation/storybook/recap-fixtures";
import { dayjs } from "@/shared/date/dayjs";

type CalendarRecapTemplateStoryArgs = ComponentProps<
  typeof CalendarCollageRecapTemplate
> & {
  calendarRecapPhotoCount: "4" | "5" | "6" | "7" | "8" | "9" | "10";
};

const CALENDAR_RECAP_PHOTO_COUNT_OPTIONS = ["4", "5", "6", "7", "8", "9", "10"];
const CALENDAR_RECAP_PHOTO_COUNT_LABELS = {
  "4": "4 total / bg 1 / calendar 3",
  "5": "5 total / bg 1 / calendar 4",
  "6": "6 total / bg 1 / calendar 5",
  "7": "7 total / bg 4 / calendar 3",
  "8": "8 total / bg 4 / calendar 4",
  "9": "9 total / bg 4 / calendar 5",
  "10": "10 total / bg 4 / calendar 6",
};

const meta = {
  component: CalendarCollageRecapTemplate,
  decorators: [
    (Story) => (
      <View style={styles.phoneFrame}>
        <Story />
      </View>
    ),
  ],
  render: ({
    calendarRecapPhotoCount,
    photos,
    recap,
    ...args
  }: CalendarRecapTemplateStoryArgs) => {
    const normalizedPhotoCount = Number(calendarRecapPhotoCount);
    const selectedPhotoIds = photos
      .slice(0, normalizedPhotoCount)
      .map((photo) => photo.id);
    const { backgroundPhotoIds, calendarPhotoIds } =
      createCalendarRecapPhotoLayout(selectedPhotoIds, () => 0);

    return (
      <CalendarCollageRecapTemplate
        {...args}
        photos={photos}
        recap={{
          ...recap,
          backgroundPhotoIds,
          calendarPhotoIds,
          selectedPhotoIds,
        }}
      />
    );
  },
  argTypes: {
    calendarRecapPhotoCount: {
      control: {
        labels: CALENDAR_RECAP_PHOTO_COUNT_LABELS,
        type: "select",
      },
      options: CALENDAR_RECAP_PHOTO_COUNT_OPTIONS,
    },
  },
  parameters: {
    layout: "fullscreen",
  },
  title: "Templates/Calendar Recap",
} satisfies Meta<CalendarRecapTemplateStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    monthDate: dayjs("2026-07-01"),
    calendarRecapPhotoCount: "8",
    photos: monthlyRecapPhotoFixtures,
    recap: calendarCollageRecapFixture,
    width: 390,
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
