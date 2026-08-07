import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { UnderlineSegmentedTabs } from "@/presentation/components/molecules/underline-segmented-tabs";
import { appColors } from "@/presentation/theme/colors";

const stickerAssetTypeOptions = [
  {
    label: "Stickers",
    value: "stickers",
  },
  {
    label: "Widgets",
    value: "widgets",
  },
] as const;

function UnderlineSegmentedTabsStoryView() {
  const [currentValue, setCurrentValue] = useState("stickers");

  return (
    <UnderlineSegmentedTabs
      options={stickerAssetTypeOptions}
      value={currentValue}
      onValueChange={setCurrentValue}
    />
  );
}

const meta = {
  component: UnderlineSegmentedTabsStoryView,
  decorators: [
    (Story) => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  title: "Components/Molecules/Underline Segmented Tabs",
} satisfies Meta<typeof UnderlineSegmentedTabsStoryView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: appColors.white,
    justifyContent: "center",
    padding: 24,
    width: "100%",
  },
});
