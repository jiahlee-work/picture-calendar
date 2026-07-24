import type { Preview } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { appColors } from "../src/presentation/theme/colors";

const preview: Preview = {
  decorators: [
    (Story) => (
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <View style={styles.canvas}>
            <Story />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: appColors.background,
    flex: 1,
  },
  root: {
    flex: 1,
  },
});
