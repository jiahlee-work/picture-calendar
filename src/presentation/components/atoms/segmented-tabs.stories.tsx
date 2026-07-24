import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { SegmentedTabs } from "@/presentation/components/atoms/segmented-tabs";
import { appColors } from "@/presentation/theme/colors";

const stickerTabOptions = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Recents",
    value: "recents",
  },
] as const;

function SegmentedTabsStoryView() {
  const [currentValue, setCurrentValue] = useState("all");

  return (
    <SegmentedTabs
      options={stickerTabOptions}
      value={currentValue}
      onValueChange={setCurrentValue}
    />
  );
}

const meta = {
  component: SegmentedTabsStoryView,
  decorators: [
    (Story) => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  title: "Components/Atoms/Segmented Tabs",
} satisfies Meta<typeof SegmentedTabsStoryView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    backgroundColor: appColors.background,
    justifyContent: "center",
    padding: 24,
  },
});
