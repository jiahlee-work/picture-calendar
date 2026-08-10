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

const MESSAGE_RECAP_BUBBLE_COLOR = "#48B7FB";
const SINGLE_LINE_RADIUS = 40;
const MULTI_LINE_RADIUS = 30;
const TAIL_HEIGHT = 23;
const TAIL_WIDTH = 28;

type MessageRecapBubbleProps = {
  bubbleColor?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  text: string;
  textColor?: string;
  textStyle?: StyleProp<TextStyle>;
  lineCount?: number;
};

export function MessageRecapBubble(props: MessageRecapBubbleProps) {
  const {
    bubbleColor = MESSAGE_RECAP_BUBBLE_COLOR,
    children,
    style,
    text,
    textColor = appColors.white,
    textStyle,
    lineCount: lineCountOverride,
  } = props;
  const [measuredLineCount, setMeasuredLineCount] = useState(
    getExplicitTextLineCount(text),
  );
  const lineCount = Math.max(
    measuredLineCount,
    getExplicitTextLineCount(text),
    lineCountOverride ?? 1,
  );
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
        d="M21.5 21.0241C18.914 20.0159 8.04788 12.9668 0 6.49302C9.56785 4.14988 16.9322 2.34315 26.5 0C26.5 0 26.2327 -0.0105371 24.5 7.5C22.7673 15.0105 22.586 16 26 20C29.414 24 24.086 22.0322 21.5 21.0241Z"
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
    bottom: -7,
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
