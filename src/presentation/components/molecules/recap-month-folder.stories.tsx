import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { RecapMonthStatus } from "@/application/services/recap/recap-month-list";
import { RecapMonthFolderView } from "@/presentation/components/molecules/recap-month-folder";
import { recapMonthFixtures } from "@/presentation/storybook/recap-fixtures";

const RECAP_MONTH_FOLDER_STATUSES = {
  disabled: RecapMonthStatus.disabledEmpty,
  needsSelection: RecapMonthStatus.needsSelection,
  readyAuto: RecapMonthStatus.readyAuto,
} as const;

type RecapMonthFolderStoryStatus = keyof typeof RECAP_MONTH_FOLDER_STATUSES;

type RecapMonthFolderStoryProps = {
  status: RecapMonthFolderStoryStatus;
};

function RecapMonthFolderStoryView(props: RecapMonthFolderStoryProps) {
  const { status } = props;
  const recapStatus = RECAP_MONTH_FOLDER_STATUSES[status];
  const month =
    recapMonthFixtures.find((fixture) => fixture.status === recapStatus) ??
    recapMonthFixtures[0];

  return <RecapMonthFolderView month={month} onPress={() => undefined} />;
}

const meta = {
  argTypes: {
    status: {
      control: {
        labels: {
          disabled: "Disabled",
          needsSelection: "Needs Selection",
          readyAuto: "Ready Auto",
        },
        type: "select",
      },
      options: Object.keys(RECAP_MONTH_FOLDER_STATUSES),
    },
  },
  component: RecapMonthFolderStoryView,
  decorators: [
    (Story) => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  title: "Components/Molecules/Recap Month Folder",
} satisfies Meta<typeof RecapMonthFolderStoryView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: "needsSelection",
  },
};

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    padding: 24,
  },
});
