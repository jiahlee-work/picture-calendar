import type { Meta, StoryObj } from "@storybook/react-native";
import type { ComponentProps } from "react";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppSwitch } from "@/presentation/components/atoms/app-switch";

type AppSwitchStoryProps = Omit<
  ComponentProps<typeof AppSwitch>,
  "accessibilityLabel"
>;

function AppSwitchStoryView(props: AppSwitchStoryProps) {
  const { value, onValueChange, ...switchProps } = props;
  const [isEnabled, setIsEnabled] = useState(value);

  const handleValueChange = (nextValue: boolean) => {
    setIsEnabled(nextValue);
    onValueChange(nextValue);
  };

  return (
    <AppSwitch
      {...switchProps}
      accessibilityLabel="리캡 알림"
      value={isEnabled}
      onValueChange={handleValueChange}
    />
  );
}

const meta = {
  argTypes: {
    disabled: {
      control: {
        labels: ["true", "false"],
        type: "radio",
      },
      options: [true, false],
    },
    value: {
      control: {
        labels: ["true", "false"],
        type: "radio",
      },
      options: [true, false],
    },
    onValueChange: {
      table: {
        disable: true,
      },
    },
  },
  component: AppSwitchStoryView,
  decorators: [
    (Story) => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  title: "Components/Atoms/App Switch",
} satisfies Meta<typeof AppSwitchStoryView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    disabled: false,
    value: true,
    onValueChange: () => undefined,
  },
  render: (args) => (
    <AppSwitchStoryView key={`${args.value}-${args.disabled}`} {...args} />
  ),
};

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
