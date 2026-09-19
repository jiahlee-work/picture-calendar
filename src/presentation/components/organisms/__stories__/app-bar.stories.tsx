import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { SymbolIconButton } from "@/presentation/components/atoms/symbol-icon-button";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { appColors } from "@/presentation/theme/colors";

type CalendarAppBarStoryProps = {
  title: string;
  viewportWidth: number;
};

function CalendarAppBarStoryView(props: CalendarAppBarStoryProps) {
  const { title, viewportWidth } = props;

  return (
    <View style={[styles.viewport, { width: viewportWidth }]}>
      <AppBar>
        <AppBar.Title
          accessibilityLabel="연월 선택 열기"
          variant="large"
          onPress={() => undefined}
        >
          {title}
        </AppBar.Title>
        <View style={styles.actions}>
          <SymbolIconButton
            accessibilityLabel="캘린더 공유 버튼"
            icon="Share"
            onPress={() => undefined}
          />
        </View>
      </AppBar>
    </View>
  );
}

const meta = {
  argTypes: {
    viewportWidth: {
      control: "select",
      options: [370, 390, 402, 420, 440],
    },
  },
  component: CalendarAppBarStoryView,
  decorators: [
    (Story) => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  title: "Components/Organisms/App Bar",
} satisfies Meta<typeof CalendarAppBarStoryView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Width370: Story = {
  args: {
    title: "May 2026",
    viewportWidth: 370,
  },
};

export const Width390: Story = {
  args: {
    title: "May 2026",
    viewportWidth: 390,
  },
};

export const Width402: Story = {
  args: {
    title: "May 2026",
    viewportWidth: 402,
  },
};

export const Width420: Story = {
  args: {
    title: "May 2026",
    viewportWidth: 420,
  },
};

export const Width440: Story = {
  args: {
    title: "May 2026",
    viewportWidth: 440,
  },
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  canvas: {
    alignItems: "center",
    backgroundColor: appColors.background,
    flex: 1,
  },
  viewport: {
    backgroundColor: appColors.background,
  },
});
