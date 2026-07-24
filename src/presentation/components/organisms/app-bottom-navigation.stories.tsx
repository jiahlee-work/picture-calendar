import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import {
  AppBottomNavigationBar,
  type AppBottomNavigationRoute,
} from "@/presentation/components/organisms/app-bottom-navigation";
import { appColors } from "@/presentation/theme/colors";

type AppBottomNavigationStoryProps = {
  activeRoute: AppBottomNavigationRoute;
};

function AppBottomNavigationStoryView(props: AppBottomNavigationStoryProps) {
  const { activeRoute } = props;

  return (
    <View style={styles.phoneFrame}>
      <AppBottomNavigationBar
        activeRoute={activeRoute}
        bottomOffset={24}
        onNavigate={() => undefined}
      />
    </View>
  );
}

const meta = {
  argTypes: {
    activeRoute: {
      control: {
        labels: {
          "/": "Calendar",
          "/recap": "Recap",
          "/settings": "Settings",
          "/stickers": "Stickers",
        },
        type: "select",
      },
      options: ["/", "/recap", "/stickers", "/settings"],
    },
  },
  component: AppBottomNavigationStoryView,
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
  title: "Components/Organisms/Bottom Navigation Bar",
} satisfies Meta<typeof AppBottomNavigationStoryView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeRoute: "/",
  },
};

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    backgroundColor: appColors.background,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  phoneFrame: {
    height: 220,
    maxWidth: 430,
    position: "relative",
    width: "100%",
  },
});
