import type { RenderListProps } from "@quidone/react-native-wheel-picker";
import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, type ScrollView as NativeScrollView } from "react-native";
import { ScrollView as GestureHandlerScrollView } from "react-native-gesture-handler";

export type WheelPickerOption = {
  label: string;
  value: number;
};

const AnimatedGestureScrollView = Animated.createAnimatedComponent(GestureHandlerScrollView);

export function WheelPickerGestureScrollList(props: RenderListProps<WheelPickerOption>) {
  const {
    contentContainerStyle,
    data,
    initialIndex,
    itemHeight,
    keyExtractor,
    pickerHeight,
    readOnly,
    ref: listMethodsRef,
    renderItem,
    scrollOffset,
    onScrollEnd,
    onScrollStart,
    onTouchCancel,
    onTouchEnd,
    onTouchStart,
  } = props;
  const scrollViewRef = useRef<NativeScrollView>(null);
  const snapToOffsets = useMemo(() => data.map((_, index) => index * itemHeight), [data, itemHeight]);
  const initialOffset = useMemo(() => ({ x: 0, y: initialIndex * itemHeight }), [initialIndex, itemHeight]);
  const resolvedContentContainerStyle = useMemo(
    () => [
      {
        paddingVertical: (pickerHeight - itemHeight) / 2,
      },
      contentContainerStyle,
    ],
    [contentContainerStyle, itemHeight, pickerHeight],
  );
  const handleScroll = useMemo(
    () =>
      Animated.event(
        [
          {
            nativeEvent: {
              contentOffset: {
                y: scrollOffset,
              },
            },
          },
        ],
        {
          useNativeDriver: true,
        },
      ),
    [scrollOffset],
  );

  useEffect(() => {
    listMethodsRef.current = {
      scrollToIndex: ({ animated, index }) => {
        scrollViewRef.current?.scrollTo({
          animated,
          x: 0,
          y: index * itemHeight,
        });
      },
    };

    return () => {
      listMethodsRef.current = null;
    };
  }, [itemHeight, listMethodsRef]);

  return (
    <AnimatedGestureScrollView
      ref={scrollViewRef}
      contentContainerStyle={resolvedContentContainerStyle}
      contentOffset={initialOffset}
      decelerationRate="fast"
      disableIntervalMomentum={false}
      nestedScrollEnabled
      removeClippedSubviews={false}
      scrollEnabled={!readOnly}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      snapToOffsets={snapToOffsets}
      style={styles.wheelList}
      onMomentumScrollBegin={onScrollStart}
      onMomentumScrollEnd={onScrollEnd}
      onScroll={handleScroll}
      onScrollBeginDrag={onScrollStart}
      onScrollEndDrag={onScrollEnd}
      onTouchCancel={onTouchCancel}
      onTouchEnd={onTouchEnd}
      onTouchStart={onTouchStart}
    >
      {data.map((item, index) =>
        renderItem({
          index,
          item,
          key: keyExtractor(item, index),
        }),
      )}
    </AnimatedGestureScrollView>
  );
}

const styles = StyleSheet.create({
  wheelList: {
    width: "100%",
  },
});
