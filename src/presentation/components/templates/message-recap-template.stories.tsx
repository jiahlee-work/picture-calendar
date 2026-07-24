import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { MessageRecapTemplate } from "@/presentation/components/templates/message-recap-template";
import {
  messageRecapFixture,
  monthlyRecapPhotoFixtures,
} from "@/presentation/storybook/recap-fixtures";
import { dayjs } from "@/shared/date/dayjs";

type MessageRecapTemplateStoryProps = {
  photoCount: "1" | "2" | "3";
};

const MESSAGE_RECAP_PHOTO_COUNT_OPTIONS = ["1", "2", "3"];
const MESSAGE_RECAP_PHOTO_COUNT_LABELS = {
  "1": "1",
  "2": "2",
  "3": "3",
};

function MessageRecapTemplateStory(props: MessageRecapTemplateStoryProps) {
  const { photoCount } = props;
  const normalizedPhotoCount = Number(photoCount);

  return (
    <MessageRecapTemplate
      monthDate={dayjs("2026-07-01")}
      photos={monthlyRecapPhotoFixtures}
      recap={{
        ...messageRecapFixture,
        selectedPhotoIds: messageRecapFixture.selectedPhotoIds.slice(
          0,
          normalizedPhotoCount,
        ),
      }}
      width={390}
    />
  );
}

const meta = {
  component: MessageRecapTemplateStory,
  decorators: [
    (Story) => (
      <View style={styles.phoneFrame}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    photoCount: {
      control: {
        labels: MESSAGE_RECAP_PHOTO_COUNT_LABELS,
        type: "select",
      },
      options: MESSAGE_RECAP_PHOTO_COUNT_OPTIONS,
    },
  },
  parameters: {
    layout: "fullscreen",
  },
  title: "Templates/Message Recap",
} satisfies Meta<MessageRecapTemplateStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    photoCount: "3",
  },
};

const styles = StyleSheet.create({
  phoneFrame: {
    alignSelf: "center",
    height: 760,
    maxWidth: 430,
    width: "100%",
  },
});
