import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { MonthlyCalendar } from "@/presentation/components/organisms/monthly-calendar";
import {
  createEmptyStorybookCalendarMonth,
  createRecapSelectionStorybookCalendarMonth,
  createStorybookCalendarMonth,
  selectedStorybookDateKeys,
} from "@/presentation/storybook/fixtures/calendar-fixtures";

const SELECTION_MODE_DESCRIPTION =
  "월 사진이 10장 이상일 때 다음 달 1일에 이전 달 리캡 대표 사진을 직접 선택하는 상태입니다.";

type MonthlyCalendarStoryProps = {
  hasPhoto?: boolean;
  showTodayHighlight?: boolean;
};

function MonthlyCalendarStoryView(props: MonthlyCalendarStoryProps) {
  const { hasPhoto = true, showTodayHighlight = true } = props;
  const calendar = hasPhoto
    ? createStorybookCalendarMonth()
    : createEmptyStorybookCalendarMonth();

  return (
    <MonthlyCalendar
      calendar={calendar}
      canSwipeMonth={false}
      contentWidth={390}
      showTodayHighlight={showTodayHighlight}
      onSelectDate={() => undefined}
    />
  );
}

const meta = {
  argTypes: {
    hasPhoto: {
      control: {
        labels: ["true", "false"],
        type: "radio",
      },
      options: [true, false],
    },
    showTodayHighlight: {
      control: "boolean",
    },
  },
  component: MonthlyCalendarStoryView,
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
} satisfies Meta<typeof MonthlyCalendarStoryView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    hasPhoto: true,
    showTodayHighlight: true,
  },
};

export const Shared: Story = {
  args: {
    hasPhoto: true,
    showTodayHighlight: false,
  },
};

export const SelectionMode: Story = {
  argTypes: {
    hasPhoto: {
      control: false,
      table: {
        disable: true,
      },
    },
  },
  name: "Selection Mode (10+ Photos)",
  parameters: {
    docs: {
      description: {
        story: SELECTION_MODE_DESCRIPTION,
      },
    },
  },
  render: () => (
    <MonthlyCalendar
      calendar={createRecapSelectionStorybookCalendarMonth()}
      canSwipeMonth={false}
      contentWidth={390}
      selectedDateKeys={selectedStorybookDateKeys}
      onSelectDate={() => undefined}
    />
  ),
};

const styles = StyleSheet.create({
  phoneFrame: {
    alignSelf: "center",
    height: 760,
    maxWidth: 430,
    width: "100%",
  },
});
