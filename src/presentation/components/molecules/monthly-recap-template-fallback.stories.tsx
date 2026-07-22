import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { MonthlyRecapDetailStatus } from "@/application/services/recap/monthly-recap-detail";
import { MonthlyRecapTemplateFallback } from "@/presentation/components/molecules/monthly-recap-template-fallback";
import { MonthlyRecapTemplateId } from "@/shared/recap/types";

const meta = {
  component: MonthlyRecapTemplateFallback,
  decorators: [
    (Story) => (
      <View style={styles.frame}>
        <Story />
      </View>
    ),
  ],
  title: "Components/Molecules/Monthly Recap Template Fallback",
} satisfies Meta<typeof MonthlyRecapTemplateFallback>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    status: MonthlyRecapDetailStatus.loading,
  },
};

export const Empty: Story = {
  args: {
    photoCount: 0,
    status: MonthlyRecapDetailStatus.empty,
  },
};

export const Collecting: Story = {
  args: {
    photoCount: 4,
    status: MonthlyRecapDetailStatus.collecting,
  },
};

export const NeedsSelection: Story = {
  args: {
    photoCount: 18,
    status: MonthlyRecapDetailStatus.needsSelection,
    templateId: MonthlyRecapTemplateId.calendarCollage,
  },
};

const styles = StyleSheet.create({
  frame: {
    alignSelf: "center",
    height: 640,
    maxWidth: 390,
    width: "100%",
  },
});
