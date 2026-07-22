import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { RecapMonthFolderView } from "@/presentation/components/molecules/recap-month-folder";
import { recapMonthFixtures } from "@/presentation/storybook/recap-fixtures";

const meta = {
  component: RecapMonthFolderView,
  decorators: [
    (Story) => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  title: "Components/Molecules/Recap Month Folder",
} satisfies Meta<typeof RecapMonthFolderView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NeedsSelection: Story = {
  args: {
    month: recapMonthFixtures[0],
    onPress: () => undefined,
  },
};

export const ReadyAuto: Story = {
  args: {
    ...NeedsSelection.args,
    month: recapMonthFixtures[1],
  },
};

export const DisabledEmpty: Story = {
  args: {
    ...NeedsSelection.args,
    month: recapMonthFixtures[4],
  },
};

export const StatusGrid: Story = {
  args: {
    ...NeedsSelection.args,
  },
  render: () => (
    <View style={styles.grid}>
      {recapMonthFixtures.map((month) => (
        <RecapMonthFolderView
          key={month.month}
          month={month}
          onPress={() => undefined}
        />
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    padding: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 390,
  },
});
