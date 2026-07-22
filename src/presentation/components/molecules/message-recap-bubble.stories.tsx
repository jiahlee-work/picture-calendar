import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { MessageRecapBubble } from "@/presentation/components/molecules/message-recap-bubble";
import { appColors } from "@/presentation/theme/colors";

const meta = {
  component: MessageRecapBubble,
  decorators: [
    (Story) => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  title: "Components/Molecules/Message Recap Bubble",
} satisfies Meta<typeof MessageRecapBubble>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "My July 2026 ☀️ 🌊",
  },
};

export const LongMessage: Story = {
  args: {
    text: "My July 2026 was full of bright days, late walks, and tiny photo memories ✨",
  },
};

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: appColors.white,
    padding: 24,
    width: "100%",
  },
});
