import {
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";

import { appColors } from "@/presentation/theme/colors";

const MESSAGE_RECAP_BUBBLE_COLOR = "#1688ff";

type MessageRecapBubbleProps = {
  backgroundColor?: string;
  bubbleColor?: string;
  style?: StyleProp<ViewStyle>;
  text: string;
  textColor?: string;
  textStyle?: StyleProp<TextStyle>;
};

export function MessageRecapBubble(props: MessageRecapBubbleProps) {
  const {
    backgroundColor = appColors.white,
    bubbleColor = MESSAGE_RECAP_BUBBLE_COLOR,
    style,
    text,
    textColor = appColors.white,
    textStyle,
  } = props;

  return (
    <View style={[styles.bubble, { backgroundColor: bubbleColor }, style]}>
      <Text style={[styles.text, { color: textColor }, textStyle]}>{text}</Text>
      <View style={[styles.tail, { backgroundColor: bubbleColor }]} />
      <View style={[styles.tailCutout, { backgroundColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: "flex-end",
    borderRadius: 24,
    maxWidth: "82%",
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 12,
    position: "relative",
    zIndex: 10,
  },
  tail: {
    borderBottomLeftRadius: 16,
    bottom: 0,
    height: 25,
    position: "absolute",
    right: -7,
    width: 20,
  },
  tailCutout: {
    borderBottomLeftRadius: 10,
    bottom: 0,
    height: 25,
    position: "absolute",
    right: -26,
    width: 26,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 22,
    textAlign: "left",
  },
});
