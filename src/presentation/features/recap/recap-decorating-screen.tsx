import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { useMonthlyRecapCanvas } from "@/application/hooks/use-monthly-recap-canvas";
import { useMonthlyRecapDetail } from "@/application/hooks/use-monthly-recap-detail";
import {
  createRecapTextElement,
  deleteRecapCanvasElement,
  getNextRecapCanvasElementZIndex,
  updateRecapCanvasTextElement,
  upsertRecapCanvasElement,
  type RecapCanvasTextElementUpdate,
} from "@/application/services/recap/recap-canvas-elements";
import {
  createEmptyRecapCanvasLayoutSlotPhotoMap,
  getRecapCanvasLayoutDefinition,
  isRecapCanvasLayoutPhotoSelectionComplete,
  type RecapCanvasLayoutSlotPhotoMap,
} from "@/application/services/recap/recap-canvas-layout";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { RecapCanvasTextLayer } from "@/presentation/components/organisms/recap-canvas-text-layer";
import {
  RecapDecoratingToolbar,
  type RecapDecoratingToolbarAction,
} from "@/presentation/components/organisms/recap-decorating-toolbar";
import { RecapLayoutCanvas } from "@/presentation/components/organisms/recap-layout-canvas";
import { RecapLayoutPhotoPicker } from "@/presentation/components/organisms/recap-layout-photo-picker";
import { RecapLayoutToolbar } from "@/presentation/components/organisms/recap-layout-toolbar";
import { RecapTextColorSheet } from "@/presentation/components/organisms/recap-text-color-sheet";
import {
  RecapTextToolbar,
  type RecapTextStyleUpdate,
} from "@/presentation/components/organisms/recap-text-toolbar";
import { RecapTextTypographySheet } from "@/presentation/components/organisms/recap-text-typography-sheet";
import { useAppBottomNavigationHidden } from "@/presentation/providers/app-bottom-navigation-controller";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";
import {
  RecapCanvasLayoutId,
  type RecapCanvasElement,
  type RecapCanvasLayoutId as RecapCanvasLayoutIdType,
  type RecapCanvasLayoutState,
  type RecapCanvasTextElement,
} from "@/shared/recap/types";

type RecapDecoratingScreenProps = {
  month: string;
  year: string;
};

type RecapDecoratingMode = "default" | "layout";
type LayoutDraftSlotPhotoIdsByLayoutId = Partial<
  Record<RecapCanvasLayoutIdType, RecapCanvasLayoutSlotPhotoMap>
>;
type EditedLayoutIds = Partial<Record<RecapCanvasLayoutIdType, true>>;

const DEFAULT_LAYOUT_ID = RecapCanvasLayoutId.twoColumns;

export function RecapDecoratingScreen(props: RecapDecoratingScreenProps) {
  const { month, year } = props;
  const windowDimensions = useWindowDimensions();
  const monthKey = `${year}-${month}`;
  const { photos, recap } = useMonthlyRecapDetail(monthKey);
  const {
    canvas: savedCanvas,
    isLoading: isCanvasLoading,
    isSaving: isCanvasSaving,
    saveCanvas,
  } = useMonthlyRecapCanvas(monthKey);
  const [mode, setMode] = useState<RecapDecoratingMode>("default");
  const [committedLayoutOverride, setCommittedLayoutOverride] = useState<
    RecapCanvasLayoutState | null | undefined
  >(undefined);
  const [committedElementsOverride, setCommittedElementsOverride] = useState<
    RecapCanvasElement[] | undefined
  >(undefined);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );
  const [editingTextElementId, setEditingTextElementId] = useState<
    string | null
  >(null);
  const [isTextTypographySheetVisible, setIsTextTypographySheetVisible] =
    useState(false);
  const [isTextColorSheetVisible, setIsTextColorSheetVisible] = useState(false);
  const [textSheetElementId, setTextSheetElementId] = useState<string | null>(
    null,
  );
  const [draftLayoutId, setDraftLayoutId] =
    useState<RecapCanvasLayoutIdType | null>(DEFAULT_LAYOUT_ID);
  const [draftSlotPhotoIds, setDraftSlotPhotoIds] =
    useState<RecapCanvasLayoutSlotPhotoMap>(() =>
      createEmptyRecapCanvasLayoutSlotPhotoMap(
        getRecapCanvasLayoutDefinition(DEFAULT_LAYOUT_ID),
      ),
    );
  const [selectedLayoutSlotId, setSelectedLayoutSlotId] = useState<
    string | null
  >(null);
  const [draftSlotPhotoIdsByLayoutId, setDraftSlotPhotoIdsByLayoutId] =
    useState<LayoutDraftSlotPhotoIdsByLayoutId>({});
  const [editedLayoutIds, setEditedLayoutIds] = useState<EditedLayoutIds>({});

  useAppBottomNavigationHidden(true);

  const selectedPhotoIds = useMemo(
    () => recap?.selectedPhotoIds ?? [],
    [recap?.selectedPhotoIds],
  );
  const selectedPhotoIdSet = useMemo(
    () => new Set(selectedPhotoIds),
    [selectedPhotoIds],
  );
  const recapPhotos = useMemo(
    () => photos.filter((photo) => selectedPhotoIdSet.has(photo.id)),
    [photos, selectedPhotoIdSet],
  );
  const photosById = useMemo(
    () => Object.fromEntries(recapPhotos.map((photo) => [photo.id, photo])),
    [recapPhotos],
  );
  const draftLayout = useMemo(
    () =>
      draftLayoutId ? getRecapCanvasLayoutDefinition(draftLayoutId) : null,
    [draftLayoutId],
  );
  const committedLayout =
    committedLayoutOverride === undefined
      ? (savedCanvas?.layout ?? null)
      : committedLayoutOverride;
  const committedElements =
    committedElementsOverride === undefined
      ? (savedCanvas?.elements ?? [])
      : committedElementsOverride;
  const committedLayoutId = committedLayout?.layoutId ?? null;
  const committedSlotPhotoIds = committedLayout?.slotPhotoIds ?? {};
  const visibleLayoutId = mode === "layout" ? draftLayoutId : committedLayoutId;
  const visibleLayout = visibleLayoutId
    ? getRecapCanvasLayoutDefinition(visibleLayoutId)
    : null;
  const visibleSlotPhotoIds =
    mode === "layout" ? draftSlotPhotoIds : committedSlotPhotoIds;
  const isLayoutSelectionComplete =
    mode === "layout" &&
    (draftLayout
      ? isRecapCanvasLayoutPhotoSelectionComplete({
          layout: draftLayout,
          slotPhotoIds: draftSlotPhotoIds,
        })
      : true);
  const selectedTextElement =
    committedElements.find(
      (element): element is RecapCanvasTextElement =>
        element.id === selectedElementId && element.type === "text",
    ) ?? null;
  const textSheetElement =
    committedElements.find(
      (element): element is RecapCanvasTextElement =>
        element.id === textSheetElementId && element.type === "text",
    ) ?? null;
  const hasUnsavedDecoratingChanges =
    JSON.stringify({
      elements: committedElements,
      layout: committedLayout,
    }) !==
    JSON.stringify({
      elements: savedCanvas?.elements ?? [],
      layout: savedCanvas?.layout ?? null,
    });

  const handleCompletePress = async () => {
    if (!hasUnsavedDecoratingChanges || isCanvasSaving) {
      return;
    }

    try {
      await saveCanvas({
        elements: committedElements,
        layout: committedLayout,
      });
      setCommittedElementsOverride(undefined);
      setCommittedLayoutOverride(undefined);
    } catch {
      Alert.alert("저장 실패", "꾸민 내용을 저장하지 못했습니다.");
    }
  };

  const handleBeforeBackPress = useCallback(() => {
    if (!hasUnsavedDecoratingChanges) {
      return true;
    }

    return new Promise<boolean>((resolve) =>
      Alert.alert(
        "변경사항을 저장하지 않고 나갈까요?",
        "지금 나가면 꾸민 내용이 저장되지 않습니다.",
        [
          {
            onPress: () => resolve(false),
            style: "cancel",
            text: "취소",
          },
          {
            onPress: () => resolve(true),
            style: "destructive",
            text: "나가기",
          },
        ],
        {
          cancelable: true,
          onDismiss: () => resolve(false),
        },
      ),
    );
  }, [hasUnsavedDecoratingChanges]);

  const handleToolbarActionPress = (action: RecapDecoratingToolbarAction) => {
    if (action.id === "layout") {
      handleStartLayoutMode();
    }

    if (action.id === "text") {
      handleAddTextElement();
    }
  };

  const handleAddTextElement = () => {
    const nextTextElement = createRecapTextElement({
      id: `recap-text-${Date.now()}`,
      x: Math.max(Math.round(windowDimensions.width / 2 - 178), 24),
      y: Math.max(Math.round(windowDimensions.height / 2 - 28), 120),
      zIndex: getNextRecapCanvasElementZIndex(committedElements),
    });
    const nextElements = upsertRecapCanvasElement(
      committedElements,
      nextTextElement,
    );

    setCommittedElementsOverride(nextElements);
    setSelectedElementId(nextTextElement.id);
    setEditingTextElementId(null);
    setIsTextTypographySheetVisible(false);
    setIsTextColorSheetVisible(false);
    setTextSheetElementId(null);
  };

  const handleSelectElement = (elementId: string | null) => {
    setSelectedElementId(elementId);
    setEditingTextElementId(null);
  };

  const handleStartTextEditing = (elementId: string) => {
    setSelectedElementId(elementId);
    setEditingTextElementId(elementId);
    setIsTextTypographySheetVisible(false);
    setIsTextColorSheetVisible(false);
  };

  const handleChangeTextElement = (element: RecapCanvasTextElement) => {
    setCommittedElementsOverride(
      upsertRecapCanvasElement(committedElements, element),
    );
  };

  const handleUpdateSelectedText = (update: RecapCanvasTextElementUpdate) => {
    if (!selectedTextElement) {
      return;
    }

    handleUpdateTextElement(selectedTextElement.id, update);
  };

  const handleUpdateTextElement = (
    elementId: string,
    update: RecapCanvasTextElementUpdate,
  ) => {
    setCommittedElementsOverride(
      updateRecapCanvasTextElement(committedElements, elementId, update),
    );
  };

  const handleUpdateSelectedTextStyle = (update: RecapTextStyleUpdate) => {
    handleUpdateSelectedText(update);
  };

  const handleDeleteSelectedText = () => {
    if (!selectedTextElement) {
      return;
    }

    setCommittedElementsOverride(
      deleteRecapCanvasElement(committedElements, selectedTextElement.id),
    );
    setSelectedElementId(null);
    setEditingTextElementId(null);
    setIsTextTypographySheetVisible(false);
    setIsTextColorSheetVisible(false);
    setTextSheetElementId(null);
  };

  const handleStartLayoutMode = () => {
    const nextLayoutId = committedLayoutId ?? DEFAULT_LAYOUT_ID;
    const nextLayout = getRecapCanvasLayoutDefinition(nextLayoutId);

    setDraftLayoutId(nextLayoutId);
    setDraftSlotPhotoIds(
      committedLayoutId
        ? committedSlotPhotoIds
        : createEmptyRecapCanvasLayoutSlotPhotoMap(nextLayout),
    );
    setSelectedLayoutSlotId(nextLayout.slots[0]?.id ?? null);
    setDraftSlotPhotoIdsByLayoutId({});
    setEditedLayoutIds({});
    setMode("layout");
  };

  const discardLayoutDraft = () => {
    setSelectedLayoutSlotId(null);
    setDraftSlotPhotoIdsByLayoutId({});
    setEditedLayoutIds({});
    setSelectedElementId(null);
    setEditingTextElementId(null);
    setIsTextTypographySheetVisible(false);
    setIsTextColorSheetVisible(false);
    setMode("default");
  };

  const handleCancelLayoutPress = () => {
    Alert.alert(
      "레이아웃 적용을 취소하시겠습니까?",
      "선택한 레이아웃과 사진 변경 사항이 사라집니다.",
      [
        {
          onPress: discardLayoutDraft,
          style: "destructive",
          text: "취소하기",
        },
        {
          style: "cancel",
          text: "계속 편집",
        },
      ],
    );
  };

  const handleCompleteLayoutPress = () => {
    if (!isLayoutSelectionComplete) {
      return;
    }

    setCommittedLayoutOverride(
      draftLayoutId
        ? {
            layoutId: draftLayoutId,
            slotPhotoIds: draftSlotPhotoIds,
          }
        : null,
    );
    setSelectedLayoutSlotId(null);
    setDraftSlotPhotoIdsByLayoutId({});
    setEditedLayoutIds({});
    setMode("default");
  };

  const handleSelectLayout = (layoutId: RecapCanvasLayoutIdType | null) => {
    if (layoutId === draftLayoutId) {
      return;
    }

    if (!layoutId) {
      setDraftLayoutId(null);
      setDraftSlotPhotoIds({});
      setSelectedLayoutSlotId(null);
      return;
    }

    const nextLayout = getRecapCanvasLayoutDefinition(layoutId);
    const cachedSlotPhotoIds = draftSlotPhotoIdsByLayoutId[layoutId];
    const hasEditedOtherLayoutPhotos = Object.keys(editedLayoutIds).some(
      (editedLayoutId) => editedLayoutId !== layoutId,
    );
    const nextSlotPhotoIds =
      cachedSlotPhotoIds ??
      (layoutId === committedLayoutId && !hasEditedOtherLayoutPhotos
        ? committedSlotPhotoIds
        : createEmptyRecapCanvasLayoutSlotPhotoMap(nextLayout));

    setDraftLayoutId(layoutId);
    setDraftSlotPhotoIds(nextSlotPhotoIds);
    setSelectedLayoutSlotId(nextLayout.slots[0]?.id ?? null);
  };

  const handleSelectLayoutSlot = (slotId: string) => {
    if (mode !== "layout") {
      return;
    }

    setSelectedLayoutSlotId(slotId);
  };

  const handleSelectLayoutPhoto = (photoId: string | null) => {
    if (!selectedLayoutSlotId) {
      return;
    }

    if (!draftLayoutId) {
      return;
    }

    const previousPhotoId = draftSlotPhotoIds[selectedLayoutSlotId] ?? null;

    if (previousPhotoId === photoId) {
      return;
    }

    const wasCurrentSlotEmpty = !previousPhotoId;
    const nextSlotPhotoIds = {
      ...draftSlotPhotoIds,
      [selectedLayoutSlotId]: photoId,
    };

    setDraftSlotPhotoIds(nextSlotPhotoIds);
    setDraftSlotPhotoIdsByLayoutId((current) => ({
      ...current,
      [draftLayoutId]: nextSlotPhotoIds,
    }));
    setEditedLayoutIds((current) => ({
      ...current,
      [draftLayoutId]: true,
    }));

    if (photoId && wasCurrentSlotEmpty && draftLayout) {
      const currentSlotIndex = draftLayout.slots.findIndex(
        (slot) => slot.id === selectedLayoutSlotId,
      );
      const nextEmptySlot = draftLayout.slots
        .slice(currentSlotIndex + 1)
        .find((slot) => !nextSlotPhotoIds[slot.id]);

      if (nextEmptySlot) {
        setSelectedLayoutSlotId(nextEmptySlot.id);
      }
    }
  };

  if (!recap) {
    return (
      <View style={styles.screen}>
        <AppSafeAreaView edges={["top"]} variant="inset">
          <AppBar>
            <AppBar.BackAction
              accessibilityLabel="리캡 목록으로 돌아가기"
              fallbackHref="/recap"
            />
            <AppBar.Spacer />
          </AppBar>
        </AppSafeAreaView>
        <View style={styles.loadingPanel}>
          <ActivityIndicator color={appColors.black} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <RecapLayoutCanvas
        isEditing={mode === "layout"}
        layout={visibleLayout}
        photosById={photosById}
        selectedSlotId={mode === "layout" ? selectedLayoutSlotId : null}
        slotPhotoIds={visibleSlotPhotoIds}
        onSelectSlot={handleSelectLayoutSlot}
      >
        <Text style={styles.emptyText}>
          {mode === "layout" && !visibleLayout
            ? "레이아웃 미적용"
            : "리캡 페이지를 직접 만들어보세요!"}
        </Text>
      </RecapLayoutCanvas>
      {mode === "default" ? (
        <RecapCanvasTextLayer
          editingElementId={editingTextElementId}
          elements={committedElements}
          selectedElementId={selectedElementId}
          onChangeTextElement={handleChangeTextElement}
          onEndTextEditing={() => setEditingTextElementId(null)}
          onSelectElement={handleSelectElement}
          onStartTextEditing={handleStartTextEditing}
        />
      ) : null}
      <AppSafeAreaView
        edges={["top"]}
        pointerEvents="box-none"
        variant="overlay"
      >
        <AppBar pointerEvents="box-none" variant="overlay">
          {mode === "layout" ? (
            <AppBar.Action
              accessibilityLabel="레이아웃 선택 취소"
              icon="X"
              onPress={handleCancelLayoutPress}
            />
          ) : (
            <AppBar.BackAction
              accessibilityLabel="리캡 목록으로 돌아가기"
              fallbackHref="/recap"
              onBeforeBack={handleBeforeBackPress}
            />
          )}
          <AppBar.Spacer />
          {mode === "layout" ? (
            <AppBar.Action
              accessibilityLabel="레이아웃 선택 완료"
              disabled={!isLayoutSelectionComplete}
              icon="Check"
              onPress={handleCompleteLayoutPress}
            />
          ) : (
            <AppBar.Action
              accessibilityLabel="꾸미기 완료"
              disabled={
                !hasUnsavedDecoratingChanges ||
                isCanvasLoading ||
                isCanvasSaving
              }
              icon="Check"
              onPress={handleCompletePress}
            />
          )}
        </AppBar>
      </AppSafeAreaView>
      <View pointerEvents="box-none" style={styles.toolbarContainer}>
        {mode === "layout" ? (
          <RecapLayoutToolbar
            selectedLayoutId={draftLayoutId}
            onSelectLayout={handleSelectLayout}
          />
        ) : selectedTextElement ? (
          <RecapTextToolbar
            textElement={selectedTextElement}
            onDelete={handleDeleteSelectedText}
            onOpenColorPicker={() => {
              setTextSheetElementId(selectedTextElement.id);
              setIsTextColorSheetVisible(true);
            }}
            onOpenTypographyPicker={() => {
              setTextSheetElementId(selectedTextElement.id);
              setIsTextTypographySheetVisible(true);
            }}
            onUpdateTextStyle={handleUpdateSelectedTextStyle}
          />
        ) : (
          <RecapDecoratingToolbar onSelectAction={handleToolbarActionPress} />
        )}
      </View>
      <RecapLayoutPhotoPicker
        photos={recapPhotos}
        selectedPhotoId={
          selectedLayoutSlotId
            ? (draftSlotPhotoIds[selectedLayoutSlotId] ?? null)
            : null
        }
        visible={mode === "layout" && Boolean(selectedLayoutSlotId)}
        onSelectPhoto={handleSelectLayoutPhoto}
      />
      <RecapTextTypographySheet
        fontFamily={
          textSheetElement?.fontFamily ?? selectedTextElement?.fontFamily
        }
        fontSize={
          textSheetElement?.fontSize ?? selectedTextElement?.fontSize ?? 24
        }
        visible={isTextTypographySheetVisible}
        onChangeFontFamily={(fontFamily) => {
          const targetElementId = textSheetElementId ?? selectedTextElement?.id;

          if (targetElementId) {
            handleUpdateTextElement(targetElementId, { fontFamily });
          }
        }}
        onChangeFontSize={(fontSize) => {
          const targetElementId = textSheetElementId ?? selectedTextElement?.id;

          if (targetElementId) {
            handleUpdateTextElement(targetElementId, { fontSize });
          }
        }}
        onClose={() => {
          setIsTextTypographySheetVisible(false);
          setTextSheetElementId(null);
        }}
      />
      <RecapTextColorSheet
        value={
          textSheetElement?.color ?? selectedTextElement?.color ?? "#121212"
        }
        visible={isTextColorSheetVisible}
        onChangeColor={(color) => {
          const targetElementId = textSheetElementId ?? selectedTextElement?.id;

          if (targetElementId) {
            handleUpdateTextElement(targetElementId, { color });
          }
        }}
        onClose={() => {
          setIsTextColorSheetVisible(false);
          setTextSheetElementId(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    color: appColors.black,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 22,
  },
  loadingPanel: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  screen: {
    backgroundColor: appColors.background,
    flex: 1,
  },
  toolbarContainer: {
    alignItems: "center",
    bottom: 28,
    elevation: appLayers.bottomNavigation,
    left: 0,
    paddingHorizontal: 36,
    position: "absolute",
    right: 0,
    zIndex: appLayers.bottomNavigation,
  },
});
