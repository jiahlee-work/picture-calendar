import type { ReactNode } from "react";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import { appColors } from "@/presentation/theme/colors";

const MESSAGE_RECAP_BUBBLE_COLOR = "#1688ff";
const SINGLE_LINE_RADIUS = 999;
const MULTI_LINE_RADIUS = 34;
const TAIL_HEIGHT = 31;
const TAIL_WIDTH = 38;

type MessageRecapBubbleProps = {
  bubbleColor?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  text: string;
  textColor?: string;
  textStyle?: StyleProp<TextStyle>;
};

export function MessageRecapBubble(props: MessageRecapBubbleProps) {
  const {
    bubbleColor = MESSAGE_RECAP_BUBBLE_COLOR,
    children,
    style,
    text,
    textColor = appColors.white,
    textStyle,
  } = props;
  const [measuredLineCount, setMeasuredLineCount] = useState(
    getExplicitTextLineCount(text),
  );
  const lineCount = Math.max(measuredLineCount, getExplicitTextLineCount(text));
  const isMultiline = lineCount > 1;

  return (
    <View
      style={[
        styles.bubble,
        {
          backgroundColor: bubbleColor,
          borderRadius: isMultiline ? MULTI_LINE_RADIUS : SINGLE_LINE_RADIUS,
        },
        style,
      ]}
    >
      {children ?? (
        <Text
          style={[styles.text, { color: textColor }, textStyle]}
          onTextLayout={(event) => {
            setMeasuredLineCount(event.nativeEvent.lines.length);
          }}
        >
          {text}
        </Text>
      )}
      <MessageRecapBubbleTail color={bubbleColor} />
    </View>
  );
}

function MessageRecapBubbleTail(props: { color: string }) {
  const { color } = props;

  return (
    <Svg
      height={TAIL_HEIGHT}
      pointerEvents="none"
      style={styles.tail}
      viewBox={`0 0 ${TAIL_WIDTH} ${TAIL_HEIGHT}`}
      width={TAIL_WIDTH}
    >
      <Path
        d="M0 0 C7 0 13 4 18 9 C21.5 12.5 23.5 17 22.5 21 C22 23.5 24.5 25.5 31 27.5 C35 28.8 35 31 30.5 30.5 C20 29.5 11 23 6 14.5 C3.8 10.8 1.8 5 0 0 Z"
        fill={color}
      />
    </Svg>
  );
}

function getExplicitTextLineCount(text: string) {
  return Math.max(text.split("\n").length, 1);
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: "flex-end",
    maxWidth: "82%",
    minHeight: 52,
    paddingHorizontal: 36,
    paddingVertical: 13,
    position: "relative",
    zIndex: 10,
  },
  tail: {
    bottom: -18,
    position: "absolute",
    right: 9,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 22,
    textAlign: "left",
  },
});
