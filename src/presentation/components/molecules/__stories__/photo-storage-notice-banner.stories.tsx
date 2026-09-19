import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";

import { PhotoStorageNoticeBanner } from "@/presentation/components/molecules/photo-storage-notice-banner";
import { PhotoStorageNoticeImageProvider } from "@/presentation/providers/photo-storage-notice-image-provider";

const meta = {
  component: PhotoStorageNoticeBanner,
  decorators: [
    (Story) => (
      <PhotoStorageNoticeImageProvider>
        <View style={{ padding: 16, width: "100%" }}>
          <Story />
        </View>
      </PhotoStorageNoticeImageProvider>
    ),
  ],
  title: "Components/Molecules/Photo Storage Notice Banner",
} satisfies Meta<typeof PhotoStorageNoticeBanner>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <View style={{ maxWidth: "100%", width: 288 }}>
        <Story />
      </View>
    ),
  ],
};
