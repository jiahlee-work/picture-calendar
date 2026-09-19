import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText as Text } from "@/presentation/components/atoms/app-text";
import { RecapCanvasAspectRatioSheet } from "@/presentation/components/organisms/recap-canvas-aspect-ratio-sheet";
import { appColors } from "@/presentation/theme/colors";
import {
  RecapCanvasAspectRatio,
  type RecapCanvasAspectRatio as RecapCanvasAspectRatioType,
} from "@/shared/recap/types";

type StoryProps = {
  confirmLabel?: string;
  required: boolean;
  subtitle?: string;
  title?: string;
  value: RecapCanvasAspectRatioType;
};

function RecapCanvasAspectRatioSheetStory(props: StoryProps) {
  const {
    confirmLabel,
    required,
    subtitle,
    title,
    value: initialValue,
  } = props;
  const [value, setValue] = useState(initialValue);
  const [visible, setVisible] = useState(true);

  return (
    <BottomSheetModalProvider>
      <View style={styles.canvas}>
        <Text style={styles.valueLabel}>{value}</Text>
        {!visible ? (
          <Pressable style={styles.openButton} onPress={() => setVisible(true)}>
            <Text style={styles.openButtonLabel}>비율 선택 열기</Text>
          </Pressable>
        ) : null}
        <RecapCanvasAspectRatioSheet
          confirmLabel={confirmLabel}
          required={required}
          subtitle={subtitle}
          title={title}
          value={value}
          visible={visible}
          onCancel={() => setVisible(false)}
          onClose={() => setVisible(false)}
          onConfirm={() => setVisible(false)}
          onSelect={setValue}
        />
      </View>
    </BottomSheetModalProvider>
  );
}

const meta = {
  argTypes: {
    required: {
      control: "boolean",
    },
    value: {
      control: "select",
      options: Object.values(RecapCanvasAspectRatio),
    },
  },
  component: RecapCanvasAspectRatioSheetStory,
  title: "Components/Organisms/Recap Canvas Aspect Ratio Sheet",
} satisfies Meta<typeof RecapCanvasAspectRatioSheetStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Optional: Story = {
  args: {
    required: false,
    value: RecapCanvasAspectRatio.device,
  },
};

export const Required: Story = {
  args: {
    required: true,
    value: RecapCanvasAspectRatio.device,
  },
};

export const CalendarShare: Story = {
  args: {
    confirmLabel: "공유",
    required: false,
    subtitle:
      "이번 달 캘린더를 원하는 비율의 이미지로 공유할 수 있어요.\n공유할 비율을 선택해 주세요.",
    title: "캘린더 이미지 공유",
    value: RecapCanvasAspectRatio.device,
  },
};

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    backgroundColor: appColors.white,
    flex: 1,
    gap: 20,
    justifyContent: "center",
    padding: 24,
  },
  openButton: {
    backgroundColor: appColors.black,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  openButtonLabel: {
    color: appColors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  valueLabel: {
    color: appColors.black,
    fontSize: 18,
    fontWeight: "600",
  },
});
