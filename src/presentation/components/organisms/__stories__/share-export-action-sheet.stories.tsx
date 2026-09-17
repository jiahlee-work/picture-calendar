import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText as Text } from "@/presentation/components/atoms/app-text";
import { ShareExportActionSheet } from "@/presentation/components/organisms/share-export-action-sheet";
import { appColors } from "@/presentation/theme/colors";

function ShareExportActionSheetStory() {
  const [visible, setVisible] = useState(true);

  return (
    <BottomSheetModalProvider>
      <View style={styles.canvas}>
        {!visible ? (
          <Pressable style={styles.openButton} onPress={() => setVisible(true)}>
            <Text style={styles.openButtonLabel}>내보내기 시트 열기</Text>
          </Pressable>
        ) : null}
        <ShareExportActionSheet
          visible={visible}
          onClose={() => setVisible(false)}
          onSave={() => setVisible(false)}
          onShare={() => setVisible(false)}
        />
      </View>
    </BottomSheetModalProvider>
  );
}

const meta = {
  component: ShareExportActionSheetStory,
  title: "Components/Organisms/Share Export Action Sheet",
} satisfies Meta<typeof ShareExportActionSheetStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  openButton: {
    backgroundColor: appColors.black,
    borderCurve: "continuous",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  openButtonLabel: {
    color: appColors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
