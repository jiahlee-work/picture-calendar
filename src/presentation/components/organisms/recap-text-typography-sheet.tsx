import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBottomSheetBackdrop } from "@/presentation/components/atoms/app-bottom-sheet-backdrop";
import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";

type RecapTextTypographySheetProps = {
  fontFamily?: string;
  fontSize: number;
  visible: boolean;
  onChangeFontFamily: (fontFamily: string | undefined) => void;
  onChangeFontSize: (fontSize: number) => void;
  onClose: () => void;
};

type TypographyPopover = "fontFamily" | "fontSize";

type RecapTextFontOption = {
  fontFamily?: string;
  id: string;
  label: string;
};

type TypographyPopoverFrame = {
  height: number;
  width: number;
  x: number;
  y: number;
};

const RECAP_TEXT_FONT_OPTIONS: RecapTextFontOption[] = [
  {
    id: "system",
    label: "기본 서체",
  },
  {
    fontFamily: "Georgia",
    id: "serif",
    label: "명조",
  },
  {
    fontFamily: "Avenir Next",
    id: "rounded",
    label: "둥근 서체",
  },
  {
    fontFamily: "Menlo",
    id: "mono",
    label: "고정폭",
  },
];

const RECAP_TEXT_FONT_SIZE_OPTIONS = [
  10, 12, 14, 18, 24, 36, 48, 64, 72, 96, 144,
];
const TYPOGRAPHY_POPOVER_WIDTH = 238;
const TYPOGRAPHY_POPOVER_GAP = 8;
const TYPOGRAPHY_FONT_FAMILY_POPOVER_HEIGHT = 184;
const TYPOGRAPHY_FONT_SIZE_POPOVER_HEIGHT = 340;

export function RecapTextTypographySheet(props: RecapTextTypographySheetProps) {
  const {
    fontFamily,
    fontSize,
    onChangeFontFamily,
    onChangeFontSize,
    onClose,
    visible,
  } = props;
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const isPresentedRef = useRef(false);
  const fontFamilyRowRef = useRef<View>(null);
  const fontSizeRowRef = useRef<View>(null);
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const snapPoints = useMemo(() => ["23%"], []);
  const [activePopover, setActivePopover] = useState<TypographyPopover | null>(
    null,
  );
  const [popoverFrame, setPopoverFrame] =
    useState<TypographyPopoverFrame | null>(null);
  const selectedFontOption = getFontOption(fontFamily);
  const popoverStyle = getPopoverStyle(
    activePopover,
    popoverFrame,
    windowWidth,
  );

  useEffect(() => {
    if (visible) {
      isPresentedRef.current = true;
      bottomSheetRef.current?.present();
      return;
    }

    if (isPresentedRef.current) {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const closePopover = useCallback(() => {
    setActivePopover(null);
    setPopoverFrame(null);
  }, []);
  const handleDismiss = () => {
    isPresentedRef.current = false;
    closePopover();
    onClose();
  };
  const handleTogglePopover = useCallback(
    (nextPopover: TypographyPopover, rowRef: RefObject<View | null>) => {
      if (activePopover === nextPopover) {
        closePopover();
        return;
      }

      rowRef.current?.measureInWindow((x, y, width, height) => {
        setPopoverFrame({ height, width, x, y });
        setActivePopover(nextPopover);
      });
    },
    [activePopover, closePopover],
  );
  const handleSelectFontFamily = (nextFontFamily: string | undefined) => {
    onChangeFontFamily(nextFontFamily);
    closePopover();
  };
  const handleSelectFontSize = (nextFontSize: number) => {
    onChangeFontSize(nextFontSize);
    closePopover();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      backdropComponent={AppBottomSheetBackdrop}
      backgroundStyle={styles.sheetBackground}
      containerStyle={styles.sheetContainer}
      enableDynamicSizing={false}
      enablePanDownToClose
      handleIndicatorStyle={styles.handleIndicator}
      index={0}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
    >
      <BottomSheetView
        style={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 18),
          },
        ]}
      >
        <View style={styles.rows}>
          <View ref={fontFamilyRowRef} collapsable={false}>
            <TypographyRow
              isActive={activePopover === "fontFamily"}
              label="서체"
              value={selectedFontOption.label}
              onPress={() =>
                handleTogglePopover("fontFamily", fontFamilyRowRef)
              }
            />
          </View>
          <View ref={fontSizeRowRef} collapsable={false}>
            <TypographyRow
              isActive={activePopover === "fontSize"}
              label="글자 크기"
              value={String(fontSize)}
              onPress={() => handleTogglePopover("fontSize", fontSizeRowRef)}
            />
          </View>
        </View>
      </BottomSheetView>
      <Modal
        transparent
        animationType="fade"
        visible={activePopover !== null}
        onRequestClose={closePopover}
      >
        <View style={styles.modalRoot} pointerEvents="box-none">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="서체와 글자 크기 옵션 닫기"
            style={StyleSheet.absoluteFill}
            onPress={closePopover}
          />
          {activePopover === "fontFamily" ? (
            <View style={[styles.floatingPopover, popoverStyle]}>
              {RECAP_TEXT_FONT_OPTIONS.map((option) => {
                const isSelected = option.id === selectedFontOption.id;

                return (
                  <TypographyOption
                    key={option.id}
                    isSelected={isSelected}
                    label={option.label}
                    labelStyle={
                      option.fontFamily
                        ? { fontFamily: option.fontFamily }
                        : undefined
                    }
                    onPress={() => handleSelectFontFamily(option.fontFamily)}
                  />
                );
              })}
            </View>
          ) : null}
          {activePopover === "fontSize" ? (
            <View
              style={[
                styles.floatingPopover,
                styles.fontSizePopover,
                popoverStyle,
              ]}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {RECAP_TEXT_FONT_SIZE_OPTIONS.map((option) => (
                  <TypographyOption
                    key={option}
                    isSelected={option === fontSize}
                    label={`${option}pt`}
                    onPress={() => handleSelectFontSize(option)}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>
    </BottomSheetModal>
  );
}

function TypographyRow(props: {
  isActive: boolean;
  label: string;
  value: string;
  onPress: () => void;
}) {
  const { isActive, label, onPress, value } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} 옵션 열기`}
      accessibilityState={{ selected: isActive }}
      style={({ pressed }) => [
        styles.row,
        isActive && styles.activeRow,
        pressed && styles.pressedOption,
      ]}
      onPress={onPress}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </Pressable>
  );
}

function TypographyOption(props: {
  isSelected: boolean;
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  onPress: () => void;
}) {
  const { isSelected, label, labelStyle, onPress } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} 선택`}
      accessibilityState={{ selected: isSelected }}
      style={({ pressed }) => [styles.option, pressed && styles.pressedOption]}
      onPress={onPress}
    >
      <View style={styles.optionCheck}>
        {isSelected ? (
          <ReiconIcon color={appColors.black} name="Check" size={20} />
        ) : null}
      </View>
      <Text style={[styles.optionText, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

function getFontOption(fontFamily: string | undefined): RecapTextFontOption {
  return (
    RECAP_TEXT_FONT_OPTIONS.find(
      (option) => option.fontFamily === fontFamily,
    ) ?? RECAP_TEXT_FONT_OPTIONS[0]
  );
}

function getPopoverStyle(
  activePopover: TypographyPopover | null,
  frame: TypographyPopoverFrame | null,
  windowWidth: number,
) {
  if (!activePopover || !frame) {
    return null;
  }

  const popoverHeight =
    activePopover === "fontSize"
      ? TYPOGRAPHY_FONT_SIZE_POPOVER_HEIGHT
      : TYPOGRAPHY_FONT_FAMILY_POPOVER_HEIGHT;
  const left = clamp(
    frame.x + frame.width - TYPOGRAPHY_POPOVER_WIDTH,
    12,
    windowWidth - TYPOGRAPHY_POPOVER_WIDTH - 12,
  );
  const top = Math.max(20, frame.y - popoverHeight - TYPOGRAPHY_POPOVER_GAP);

  return {
    left,
    top,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const styles = StyleSheet.create({
  activeRow: {
    backgroundColor: "#F2F2F2",
  },
  content: {
    gap: 12,
    minHeight: 150,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  floatingPopover: {
    backgroundColor: "#F7F7F7",
    borderColor: "rgba(255,255,255,0.75)",
    borderRadius: 28,
    borderWidth: 1,
    maxHeight: 260,
    overflow: "hidden",
    paddingVertical: 8,
    position: "absolute",
    shadowColor: appColors.black,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    width: 238,
    zIndex: appLayers.bottomSheet + 1,
  },
  fontSizePopover: {
    maxHeight: 340,
  },
  handleIndicator: {
    backgroundColor: "#dddddd",
    width: 42,
  },
  modalRoot: {
    backgroundColor: "transparent",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  option: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 42,
    paddingHorizontal: 18,
  },
  optionCheck: {
    alignItems: "center",
    justifyContent: "center",
    width: 30,
  },
  optionText: {
    color: appColors.black,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
  },
  pressedOption: {
    opacity: 0.62,
  },
  row: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: 14,
  },
  rowLabel: {
    color: appColors.black,
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22,
  },
  rowValue: {
    color: "rgba(18,18,18,0.62)",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  rows: {
    gap: 4,
  },
  sheetBackground: {
    backgroundColor: appColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContainer: {
    elevation: appLayers.bottomSheet,
    zIndex: appLayers.bottomSheet,
  },
});
