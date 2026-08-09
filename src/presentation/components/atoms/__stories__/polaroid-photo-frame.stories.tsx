import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { PolaroidPhotoFrame } from "@/presentation/components/atoms/polaroid-photo-frame";
import { createDailyPhotoFixture } from "@/presentation/storybook/fixtures/photo-fixtures";

const photo = createDailyPhotoFixture("polaroid-frame", "2026-07-22");

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    height: 320,
    justifyContent: "center",
    padding: 24,
  },
  landscapeFrame: {
    height: 124,
    position: "relative",
    width: 166,
  },
  leftFrame: {
    left: 20,
    top: 80,
    transform: [{ rotate: "-6deg" }],
  },
  pairCanvas: {
    height: 320,
    position: "relative",
    width: 360,
  },
  portraitFrame: {
    height: 176,
    position: "relative",
    width: 124,
  },
  rightFrame: {
    left: 188,
    top: 58,
    transform: [{ rotate: "5deg" }],
  },
});

const meta = {
  component: PolaroidPhotoFrame,
  decorators: [
    (Story) => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    orientation: {
      control: {
        labels: {
          landscape: "Landscape",
          portrait: "Portrait",
        },
        type: "select",
      },
      options: ["landscape", "portrait"],
    },
  },
  title: "Components/Atoms/Polaroid Photo Frame",
} satisfies Meta<typeof PolaroidPhotoFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    imagePath: photo.imagePath,
    orientation: "landscape",
  },
  render: ({ orientation, style, ...args }) => (
    <PolaroidPhotoFrame
      {...args}
      orientation={orientation}
      style={[
        orientation === "portrait"
          ? styles.portraitFrame
          : styles.landscapeFrame,
        style,
      ]}
    />
  ),
};

const pairArgs = {
  imagePath: photo.imagePath,
  orientation: "landscape",
} satisfies Story["args"];

export const Pair: Story = {
  args: pairArgs,
  argTypes: {
    orientation: {
      table: {
        disable: true,
      },
    },
  },
  render: () => (
    <View style={styles.pairCanvas}>
      <PolaroidPhotoFrame
        imagePath={photo.imagePath}
        orientation="landscape"
        style={[styles.landscapeFrame, styles.leftFrame]}
      />
      <PolaroidPhotoFrame
        imagePath={photo.imagePath}
        orientation="portrait"
        style={[styles.portraitFrame, styles.rightFrame]}
      />
    </View>
  ),
};
