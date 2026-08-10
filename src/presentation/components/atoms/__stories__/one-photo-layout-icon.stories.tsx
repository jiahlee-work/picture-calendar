import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { OnePhotoLayoutIcon } from "@/presentation/components/atoms/one-photo-layout-icon";
import { appColors } from "@/presentation/theme/colors";

const meta = {
  argTypes: {
    filled: {
      control: "boolean",
    },
    size: {
      control: {
        max: 64,
        min: 16,
        step: 1,
        type: "range",
      },
    },
  },
  component: OnePhotoLayoutIcon,
  decorators: [
    (Story) => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  title: "Components/Atoms/One Photo Layout Icon",
} satisfies Meta<typeof OnePhotoLayoutIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    color: appColors.black,
    filled: false,
    size: 32,
  },
};

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    backgroundColor: appColors.white,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
});
