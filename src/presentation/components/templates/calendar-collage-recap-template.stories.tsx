import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { createCalendarRecapPhotoLayout } from "@/application/services/recap/monthly-recap-layout";
import { CalendarCollageRecapTemplate } from "@/presentation/components/templates/calendar-collage-recap-template";
import {
  calendarCollageRecapFixture,
  monthlyRecapPhotoFixtures,
} from "@/presentation/storybook/recap-fixtures";
import { dayjs } from "@/shared/date/dayjs";

type CalendarRecapTemplateStoryProps = {
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

function CalendarRecapTemplateStory(props: CalendarRecapTemplateStoryProps) {
  const { calendarRecapPhotoCount } = props;
  const normalizedPhotoCount = Number(calendarRecapPhotoCount);
  const selectedPhotoIds = monthlyRecapPhotoFixtures
    .slice(0, normalizedPhotoCount)
    .map((photo) => photo.id);
  const { backgroundPhotoIds, calendarPhotoIds } =
    createCalendarRecapPhotoLayout(selectedPhotoIds, () => 0);

  return (
    <CalendarCollageRecapTemplate
      monthDate={dayjs("2026-07-01")}
      photos={monthlyRecapPhotoFixtures}
      recap={{
        ...calendarCollageRecapFixture,
        backgroundPhotoIds,
        calendarPhotoIds,
        selectedPhotoIds,
      }}
      width={390}
    />
  );
}

const meta = {
  component: CalendarRecapTemplateStory,
  decorators: [
    (Story) => (
      <View style={styles.phoneFrame}>
        <Story />
      </View>
    ),
  ],
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
} satisfies Meta<CalendarRecapTemplateStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    calendarRecapPhotoCount: "8",
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
