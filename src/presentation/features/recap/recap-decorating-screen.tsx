import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { AppText as Text } from "@/presentation/components/atoms/app-text";

import { useStickerLibrary } from "@/application/hooks/use-sticker-library";
import { useMonthlyRecapCanvas } from "@/application/hooks/use-monthly-recap-canvas";
import { useMonthlyRecapDetail } from "@/application/hooks/use-monthly-recap-detail";
import { translate } from "@/application/services/localization/app-i18n";
import { normalizeRecapCanvasBackgroundColor } from "@/application/services/recap/recap-canvas-background";
import { hasRecapCanvasContent } from "@/application/services/recap/recap-canvas-content";
import {
  createRecapTextElement,
  deleteRecapCanvasElement,
  getRecapCanvasElementLayerCapabilities,
  getNextRecapCanvasElementZIndex,
  getRecapPhotoElementSize,
  moveRecapCanvasElement,
  updateRecapCanvasTextElement,
  upsertRecapCanvasElement,
  type RecapCanvasTextElementUpdate,
} from "@/application/services/recap/recap-canvas-elements";
import { createRecapCanvasAssetInsertion } from "@/application/services/recap/recap-canvas-asset";
import { cropImage } from "@/infrastructure/device/media/crop-image";
import { insertRecapCanvasPhotoElements } from "@/application/services/recap/recap-canvas-photo";
import { loadRecapPhotoElementSize } from "@/application/services/recap/recap-photo-element-size";
import {
  DEFAULT_RECAP_TEXT_COLOR,
  DEFAULT_RECAP_TEXT_FONT_SIZE,
  normalizeRecapTextColor,
  type RecapTextStyleUpdate,
} from "@/application/services/recap/recap-canvas-text";
import { getRecapCanvasLayoutDefinition } from "@/application/services/recap/recap-canvas-layout";
import {
  createRecapCanvasLayoutDraft,
  getRecapCanvasLayoutDraftSlotPhotoIds,
  isRecapCanvasLayoutDraftComplete,
  selectRecapCanvasLayoutDraft,
  toRecapCanvasLayoutState,
  updateRecapCanvasLayoutDraftSlot,
} from "@/application/services/recap/recap-canvas-layout-draft";
import type { StickerAsset } from "@/application/services/stickers/types";
import { AppSafeAreaView } from "@/presentation/components/atoms/app-safe-area-view";
import { ReiconIcon } from "@/presentation/components/atoms/reicon-icon";
import { AppBar } from "@/presentation/components/organisms/app-bar";
import { RecapCanvasElementStack } from "@/presentation/components/organisms/recap-canvas-element-stack";
import { RecapCanvasAspectRatioSheet } from "@/presentation/components/organisms/recap-canvas-aspect-ratio-sheet";
import { RecapElementLayerToolbar } from "@/presentation/components/organisms/recap-element-layer-toolbar";
import {
  RecapDecoratingToolbar,
  type RecapDecoratingToolbarActionId,
} from "@/presentation/components/organisms/recap-decorating-toolbar";
import { RecapLayoutCanvas } from "@/presentation/components/organisms/recap-layout-canvas";
import { RecapPhotoCalendarSheet } from "@/presentation/components/organisms/recap-photo-calendar-sheet";
import { RecapLayoutToolbar } from "@/presentation/components/organisms/recap-layout-toolbar";
import { RecapColorSheet } from "@/presentation/components/organisms/recap-color-sheet";
import { RecapTextToolbar } from "@/presentation/components/organisms/recap-text-toolbar";
import { RecapTextTypographySheet } from "@/presentation/components/organisms/recap-text-typography-sheet";
import { NativeActionMenu } from "@/presentation/components/molecules/native-action-menu";
import type { NativeActionMenuAction } from "@/presentation/components/molecules/native-action-menu.types";
import {
  ShareCaptureMenu,
  type ShareCaptureMenuHandle,
} from "@/presentation/components/organisms/share-capture-menu";
import { StickerPickerSheet } from "@/presentation/components/organisms/sticker-picker-sheet";
import { useAppBottomNavigationHidden } from "@/presentation/providers/app-bottom-navigation-controller";
import { getCanvasDimensions } from "@/presentation/helpers/canvas/canvas-aspect-ratio-layout";
import { appColors } from "@/presentation/theme/colors";
import { appLayers } from "@/presentation/theme/layers";
import {
  RecapCanvasLayoutId,
  RecapCanvasAspectRatio,
  type RecapCanvasAspectRatio as RecapCanvasAspectRatioType,
  type RecapCanvasElement,
  type RecapCanvasLayoutId as RecapCanvasLayoutIdType,
  type RecapCanvasLayoutState,
  type RecapCanvasTextElement,
  type RecapCanvasWidgetElement,
} from "@/shared/recap/types";

type RecapDecoratingScreenProps = {
  month: string;
  year: string;
};

type RecapDecoratingMode = "default" | "layout";
type ActiveRecapTextSheet = "color" | "typography" | null;

const DEFAULT_LAYOUT_ID = RecapCanvasLayoutId.twoColumns;
function createRecapMenuActions(): NativeActionMenuAction[] {
  return [
    {
      icon: "share",
      id: "share",
      title: translate("common.shareAction"),
    },
    {
      icon: "aspectRatio",
      id: "aspectRatio",
      title: translate("recapEditor.aspectRatio"),
    },
  ];
}

export function RecapDecoratingScreen(props: RecapDecoratingScreenProps) {
  const { month, year } = props;
  const router = useRouter();
  const windowDimensions = useWindowDimensions();
  const shareCaptureRef = useRef<View>(null);
  const shareCaptureMenuRef = useRef<ShareCaptureMenuHandle>(null);
  const canvasElementSequenceRef = useRef(0);
  const monthKey = `${year}-${month}`;
  const { photos, status } = useMonthlyRecapDetail(monthKey);
  const {
    isLoading: isStickerLibraryLoading,
    isSaving: isStickerLibrarySaving,
    stickers,
    registerFromClipboard,
    registerFromLibrary,
  } = useStickerLibrary();
  const {
    canvas: savedCanvas,
    entryCanvas,
    entryMonthKey,
    isLoading: isCanvasLoading,
    isSaving: isCanvasSaving,
    saveCanvas,
  } = useMonthlyRecapCanvas(monthKey);
  const [mode, setMode] = useState<RecapDecoratingMode>("default");
  const [committedAspectRatioOverride, setCommittedAspectRatioOverride] =
    useState<RecapCanvasAspectRatioType | undefined>(undefined);
  const [pendingAspectRatio, setPendingAspectRatio] = useState<
    RecapCanvasAspectRatioType | undefined
  >(undefined);
  const [isCanvasAspectRatioSheetVisible, setIsCanvasAspectRatioSheetVisible] =
    useState(false);
  const [committedLayoutOverride, setCommittedLayoutOverride] = useState<
    RecapCanvasLayoutState | null | undefined
  >(undefined);
  const [
    committedBackgroundColorOverride,
    setCommittedBackgroundColorOverride,
  ] = useState<string | undefined>(undefined);
  const [committedElementsOverride, setCommittedElementsOverride] = useState<
    RecapCanvasElement[] | undefined
  >(undefined);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );
  const [longPressedElementId, setLongPressedElementId] = useState<
    string | null
  >(null);
  const [editingTextElementId, setEditingTextElementId] = useState<
    string | null
  >(null);
  const [editingWidgetElementId, setEditingWidgetElementId] = useState<
    string | null
  >(null);
  const [isStickerPickerVisible, setIsStickerPickerVisible] = useState(false);
  const [stickerPickerSnapIndex, setStickerPickerSnapIndex] = useState(0);
  const [isPolaroidPhotoPickerVisible, setIsPolaroidPhotoPickerVisible] =
    useState(false);
  const [isPhotoPickerVisible, setIsPhotoPickerVisible] = useState(false);
  const [isAddingSelectedPhotos, setIsAddingSelectedPhotos] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [activeTextSheet, setActiveTextSheet] =
    useState<ActiveRecapTextSheet>(null);
  const [isBackgroundColorSheetVisible, setIsBackgroundColorSheetVisible] =
    useState(false);
  const [textSheetElementId, setTextSheetElementId] = useState<string | null>(
    null,
  );
  const [layoutDraft, setLayoutDraft] = useState(() =>
    createRecapCanvasLayoutDraft(null, DEFAULT_LAYOUT_ID),
  );
  const [selectedLayoutSlotId, setSelectedLayoutSlotId] = useState<
    string | null
  >(null);
  const [pendingLayoutPhotoId, setPendingLayoutPhotoId] = useState<
    string | null
  >(null);
  const [pendingPolaroidPhotoId, setPendingPolaroidPhotoId] = useState<
    string | null
  >(null);
  useAppBottomNavigationHidden(true);

  const photosById = useMemo(
    () => Object.fromEntries(photos.map((photo) => [photo.id, photo])),
    [photos],
  );
  const draftLayoutId = layoutDraft.layoutId;
  const draftSlotPhotoIds = getRecapCanvasLayoutDraftSlotPhotoIds(layoutDraft);
  const committedLayout =
    committedLayoutOverride === undefined
      ? (savedCanvas?.layout ?? null)
      : committedLayoutOverride;
  const committedLayoutDefinition = committedLayout?.layoutId
    ? getRecapCanvasLayoutDefinition(committedLayout.layoutId)
    : null;
  const committedElements =
    committedElementsOverride === undefined
      ? (savedCanvas?.elements ?? [])
      : committedElementsOverride;
  const committedLayoutId = committedLayout?.layoutId ?? null;
  const savedAspectRatio = savedCanvas?.aspectRatio;
  const committedAspectRatio =
    committedAspectRatioOverride ?? savedAspectRatio ?? null;
  const visibleAspectRatio =
    committedAspectRatio ?? RecapCanvasAspectRatio.device;
  const isConstrainedCanvasAspectRatio =
    visibleAspectRatio !== RecapCanvasAspectRatio.device;
  const canvasDimensions = useMemo(
    () => getCanvasDimensions(visibleAspectRatio, windowDimensions),
    [visibleAspectRatio, windowDimensions],
  );
  const savedBackgroundColor = normalizeRecapCanvasBackgroundColor(
    savedCanvas?.backgroundColor,
  );
  const committedBackgroundColor = normalizeRecapCanvasBackgroundColor(
    committedBackgroundColorOverride ?? savedBackgroundColor,
  );
  const committedSlotPhotoIds = committedLayout?.slotPhotoIds ?? {};
  const visibleLayoutId = mode === "layout" ? draftLayoutId : committedLayoutId;
  const visibleLayout = visibleLayoutId
    ? getRecapCanvasLayoutDefinition(visibleLayoutId)
    : null;
  const visibleSlotPhotoIds =
    mode === "layout" ? draftSlotPhotoIds : committedSlotPhotoIds;
  const isLayoutSelectionComplete =
    mode === "layout" && isRecapCanvasLayoutDraftComplete(layoutDraft);
  const selectedTextElement =
    committedElements.find(
      (element): element is RecapCanvasTextElement =>
        element.id === selectedElementId && element.type === "text",
    ) ?? null;
  const selectedTextLayerCapabilities = selectedTextElement
    ? getRecapCanvasElementLayerCapabilities(
        committedElements,
        selectedTextElement.id,
      )
    : { canMoveBackward: false, canMoveForward: false };
  const textSheetElement =
    committedElements.find(
      (element): element is RecapCanvasTextElement =>
        element.id === textSheetElementId && element.type === "text",
    ) ?? null;
  const selectedCanvasElement =
    committedElements.find(
      (element) => element.id === selectedElementId && element.type !== "text",
    ) ?? null;
  const selectedCanvasElementLayerCapabilities = selectedCanvasElement
    ? getRecapCanvasElementLayerCapabilities(
        committedElements,
        selectedCanvasElement.id,
      )
    : { canMoveBackward: false, canMoveForward: false };
  const selectedPolaroidWidgetElement =
    committedElements.find(
      (
        element,
      ): element is RecapCanvasWidgetElement & {
        variant: "polaroidFrame" | "polaroidFramePortrait";
      } =>
        element.id === selectedElementId &&
        element.type === "widget" &&
        (element.variant === "polaroidFrame" ||
          element.variant === "polaroidFramePortrait"),
    ) ?? null;
  const isPhotoCalendarVisible =
    (mode === "layout" && Boolean(selectedLayoutSlotId)) ||
    (mode === "default" && isPolaroidPhotoPickerVisible);
  const hasUnsavedDecoratingChanges =
    JSON.stringify({
      aspectRatio: committedAspectRatio,
      backgroundColor: committedBackgroundColor,
      elements: committedElements,
      layout: committedLayout,
    }) !==
    JSON.stringify({
      aspectRatio: savedAspectRatio ?? null,
      backgroundColor: savedBackgroundColor,
      elements: savedCanvas?.elements ?? [],
      layout: savedCanvas?.layout ?? null,
    });
  const hasCanvasContent = hasRecapCanvasContent({
    backgroundColor: committedBackgroundColor,
    elements: committedElements,
    layout: committedLayout,
  });
  const emptyCanvasMessage =
    mode === "layout" && !visibleLayout
      ? translate("recapEditor.noLayout")
      : hasCanvasContent
        ? null
        : translate("recapEditor.emptyMessage");
  const requiresInitialAspectRatioSelection =
    !isCanvasLoading &&
    entryMonthKey === monthKey &&
    entryCanvas === null &&
    committedAspectRatioOverride === undefined;

  const handleCompletePress = async () => {
    if (!hasUnsavedDecoratingChanges || isCanvasSaving) {
      return;
    }

    try {
      await saveCanvas({
        aspectRatio: visibleAspectRatio,
        backgroundColor: committedBackgroundColor,
        elements: committedElements,
        layout: committedLayout,
      });
      setCommittedElementsOverride(undefined);
      setCommittedLayoutOverride(undefined);
      setCommittedBackgroundColorOverride(undefined);
      setSelectedElementId(null);
      setEditingTextElementId(null);
      setEditingWidgetElementId(null);
      setActiveTextSheet(null);
      setIsBackgroundColorSheetVisible(false);
      setTextSheetElementId(null);
    } catch {
      Alert.alert(
        translate("recapEditor.saveFailedTitle"),
        translate("recapEditor.saveFailedMessage"),
      );
    }
  };

  const handleBeforeBackPress = useCallback(() => {
    if (!hasUnsavedDecoratingChanges) {
      return true;
    }

    return new Promise<boolean>((resolve) =>
      Alert.alert(
        translate("recapEditor.leaveTitle"),
        translate("recapEditor.leaveMessage"),
        [
          {
            onPress: () => resolve(false),
            style: "cancel",
            text: translate("common.cancel"),
          },
          {
            onPress: () => resolve(true),
            style: "destructive",
            text: translate("recapEditor.leaveAction"),
          },
        ],
        {
          cancelable: true,
          onDismiss: () => resolve(false),
        },
      ),
    );
  }, [hasUnsavedDecoratingChanges]);

  const clearSelectedCanvasElement = () => {
    setSelectedElementId(null);
    setLongPressedElementId(null);
    setEditingTextElementId(null);
    setEditingWidgetElementId(null);
  };

  const handleOpenCanvasAspectRatioSheet = () => {
    setPendingAspectRatio(visibleAspectRatio);
    requestAnimationFrame(() => setIsCanvasAspectRatioSheetVisible(true));
  };

  const handleSelectCanvasAspectRatio = (
    nextAspectRatio: RecapCanvasAspectRatioType,
  ) => {
    setPendingAspectRatio(nextAspectRatio);
  };

  const handleConfirmCanvasAspectRatio = () => {
    setCommittedAspectRatioOverride(pendingAspectRatio ?? visibleAspectRatio);
    setPendingAspectRatio(undefined);
    setIsCanvasAspectRatioSheetVisible(false);
  };

  const handleCloseCanvasAspectRatioSheet = () => {
    setPendingAspectRatio(undefined);
    setIsCanvasAspectRatioSheetVisible(false);
  };

  const handleCancelCanvasAspectRatio = () => {
    if (requiresInitialAspectRatioSelection) {
      setPendingAspectRatio(undefined);
      router.back();
      return;
    }

    handleCloseCanvasAspectRatioSheet();
  };

  const handleToolbarActionPress = (
    actionId: RecapDecoratingToolbarActionId,
  ) => {
    switch (actionId) {
      case "layout":
        handleStartLayoutMode();
        return;
      case "text":
        handleAddTextElement();
        return;
      case "background":
        if (committedLayoutId) {
          return;
        }

        setIsBackgroundColorSheetVisible(true);
        clearSelectedCanvasElement();
        return;
      case "sticker":
        setIsStickerPickerVisible(true);
        setStickerPickerSnapIndex(0);
        clearSelectedCanvasElement();
        return;
      case "photo":
        setSelectedPhotoIds([]);
        setIsPhotoPickerVisible(true);
        clearSelectedCanvasElement();
    }
  };

  const handleAddTextElement = () => {
    const nextTextElement = createRecapTextElement({
      id: `recap-text-${Date.now()}`,
      x: Math.max(Math.round(canvasDimensions.width / 2 - 178), 24),
      y: Math.max(Math.round(canvasDimensions.height / 2 - 28), 24),
      zIndex: getNextRecapCanvasElementZIndex(committedElements),
    });
    const nextElements = upsertRecapCanvasElement(
      committedElements,
      nextTextElement,
    );

    setCommittedElementsOverride(nextElements);
    setSelectedElementId(nextTextElement.id);
    setEditingTextElementId(null);
    setEditingWidgetElementId(null);
    setActiveTextSheet(null);
    setTextSheetElementId(null);
  };

  const handleSelectElement = (elementId: string | null) => {
    setSelectedElementId(elementId);
    setLongPressedElementId(null);
    setEditingTextElementId(null);
    setEditingWidgetElementId(null);
    setActiveTextSheet(null);
    setTextSheetElementId(null);
  };

  const handleLongPressElement = (elementId: string) => {
    setLongPressedElementId(elementId);
  };

  const handleRequestPhotoSelection = (elementId: string) => {
    setSelectedElementId(elementId);
    const element = committedElements.find((item) => item.id === elementId);
    setPendingPolaroidPhotoId(
      element?.type === "widget" && "photoId" in element
        ? (element.photoId ?? null)
        : null,
    );
    setIsPolaroidPhotoPickerVisible(true);
  };

  const handleStartTextEditing = (elementId: string) => {
    setSelectedElementId(elementId);
    setEditingTextElementId(elementId);
    setEditingWidgetElementId(null);
    setActiveTextSheet(null);
    setTextSheetElementId(null);
  };

  const handleStartWidgetEditing = (elementId: string) => {
    setSelectedElementId(elementId);
    setEditingTextElementId(null);
    setEditingWidgetElementId(elementId);
    setActiveTextSheet(null);
    setTextSheetElementId(null);
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

  const handleChangeCanvasElement = (
    element: Exclude<RecapCanvasElement, { type: "text" }>,
  ) => {
    setCommittedElementsOverride(
      upsertRecapCanvasElement(committedElements, element),
    );
  };

  const handleTogglePhotoCrop = async (elementId: string) => {
    const element = committedElements.find((item) => item.id === elementId);

    if (element?.type !== "photo" || !photosById[element.photoId]) {
      return;
    }

    try {
      const result = await cropImage(
        element.imagePath ?? photosById[element.photoId].imagePath,
      );

      if (!result) {
        return;
      }

      const size = getRecapPhotoElementSize(result.width, result.height);
      handleChangeCanvasElement({
        ...element,
        crop: undefined,
        height: size.height,
        imagePath: result.uri,
        width: size.width,
      });
    } catch {
      Alert.alert(
        translate("recapEditor.cropFailedTitle"),
        translate("recapEditor.cropFailedMessage"),
      );
    }
  };

  const handleDeleteCanvasElement = (elementId: string) => {
    setCommittedElementsOverride(
      deleteRecapCanvasElement(committedElements, elementId),
    );
    setSelectedElementId(null);
    setLongPressedElementId(null);
    setEditingTextElementId(null);
    setEditingWidgetElementId(null);
  };

  const handleUpdateTextElement = (
    elementId: string,
    update: RecapCanvasTextElementUpdate,
  ) => {
    setCommittedElementsOverride(
      updateRecapCanvasTextElement(committedElements, elementId, update),
    );
  };

  const handleMoveCanvasElement = (
    elementId: string,
    direction: "backward" | "forward",
  ) => {
    setCommittedElementsOverride(
      moveRecapCanvasElement(committedElements, elementId, direction),
    );
  };

  const handleUpdateSelectedTextStyle = (update: RecapTextStyleUpdate) => {
    handleUpdateSelectedText(update);
  };

  const handleOpenSelectedTextSheet = (
    nextSheet: Exclude<ActiveRecapTextSheet, null>,
  ) => {
    if (!selectedTextElement) {
      return;
    }

    setEditingTextElementId(null);
    setTextSheetElementId(selectedTextElement.id);
    setActiveTextSheet(nextSheet);
  };

  const handleUpdateTextSheetElement = (
    update: RecapCanvasTextElementUpdate,
  ) => {
    if (!textSheetElement) {
      return;
    }

    handleUpdateTextElement(textSheetElement.id, update);
  };

  const handleCloseTextSheet = () => {
    setActiveTextSheet(null);
    setTextSheetElementId(null);
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
    setEditingWidgetElementId(null);
    setActiveTextSheet(null);
    setTextSheetElementId(null);
  };

  const handleStartLayoutMode = () => {
    setLayoutDraft(
      createRecapCanvasLayoutDraft(committedLayout, DEFAULT_LAYOUT_ID),
    );
    setSelectedLayoutSlotId(null);
    setPendingLayoutPhotoId(null);
    setIsPolaroidPhotoPickerVisible(false);
    setActiveTextSheet(null);
    setTextSheetElementId(null);
    setMode("layout");
  };

  const discardLayoutDraft = () => {
    setSelectedLayoutSlotId(null);
    setPendingLayoutPhotoId(null);
    setIsPolaroidPhotoPickerVisible(false);
    setSelectedElementId(null);
    setEditingTextElementId(null);
    setEditingWidgetElementId(null);
    setActiveTextSheet(null);
    setTextSheetElementId(null);
    setMode("default");
  };

  const handleCancelLayoutPress = () => {
    Alert.alert(
      translate("recapEditor.cancelLayoutTitle"),
      translate("recapEditor.cancelLayoutMessage"),
      [
        {
          onPress: discardLayoutDraft,
          style: "destructive",
          text: translate("recapEditor.cancelLayoutAction"),
        },
        {
          style: "cancel",
          text: translate("recapEditor.continueEditing"),
        },
      ],
    );
  };

  const handleCompleteLayoutPress = () => {
    if (!isLayoutSelectionComplete) {
      return;
    }

    setCommittedLayoutOverride(toRecapCanvasLayoutState(layoutDraft));
    setSelectedLayoutSlotId(null);
    setPendingLayoutPhotoId(null);
    setMode("default");
  };

  const handleSelectLayout = (layoutId: RecapCanvasLayoutIdType | null) => {
    if (layoutId === draftLayoutId) {
      return;
    }

    setLayoutDraft((current) =>
      selectRecapCanvasLayoutDraft(current, layoutId),
    );
    setSelectedLayoutSlotId(null);
    setPendingLayoutPhotoId(null);
  };

  const handleSelectLayoutSlot = (slotId: string) => {
    if (mode !== "layout") {
      return;
    }

    setSelectedLayoutSlotId(slotId);
    setPendingLayoutPhotoId(draftSlotPhotoIds[slotId] ?? null);
  };

  const handleSelectLayoutPhoto = (photoIds: string[]) => {
    setPendingLayoutPhotoId(photoIds[0] ?? null);
  };

  const handleSelectPolaroidPhoto = (photoIds: string[]) => {
    setPendingPolaroidPhotoId(photoIds[0] ?? null);
  };

  const handleCompleteLayoutPhotoSelection = () => {
    if (!selectedLayoutSlotId || !draftLayoutId) return;
    setLayoutDraft((current) =>
      updateRecapCanvasLayoutDraftSlot(
        current,
        selectedLayoutSlotId,
        pendingLayoutPhotoId,
      ),
    );
    setSelectedLayoutSlotId(null);
    setPendingLayoutPhotoId(null);
  };

  const handleCompletePolaroidPhotoSelection = () => {
    if (!selectedPolaroidWidgetElement) return;
    const nextElement = {
      ...selectedPolaroidWidgetElement,
      photoId: pendingPolaroidPhotoId ?? undefined,
    };
    setCommittedElementsOverride(
      upsertRecapCanvasElement(committedElements, nextElement),
    );
    setPendingPolaroidPhotoId(null);
    setIsPolaroidPhotoPickerVisible(false);
  };

  const handleCompletePhotoSelection = async () => {
    if (selectedPhotoIds.length === 0 || isAddingSelectedPhotos) {
      return;
    }

    setIsAddingSelectedPhotos(true);

    try {
      const photoIdsToAdd = [...selectedPhotoIds];
      const measuredPhotos = await Promise.all(
        photoIdsToAdd.map(async (photoId) => {
          const photo = photosById[photoId];

          if (!photo) {
            return null;
          }

          const size = await loadRecapPhotoElementSize(photo.imagePath);

          return size ? { photoId, ...size } : null;
        }),
      );
      const selectedPhotosWithSize = measuredPhotos.filter(
        (photo): photo is NonNullable<typeof photo> => photo !== null,
      );

      if (selectedPhotosWithSize.length === 0) {
        Alert.alert(
          translate("recapEditor.loadPhotoFailedTitle"),
          translate("recapEditor.loadPhotoFailedMessage"),
        );
        return;
      }

      canvasElementSequenceRef.current += 1;
      const nextElements = insertRecapCanvasPhotoElements({
        canvasHeight: canvasDimensions.height,
        canvasWidth: canvasDimensions.width,
        elementIdPrefix: `recap-photo-${Date.now()}-${canvasElementSequenceRef.current}`,
        elements: committedElements,
        photos: selectedPhotosWithSize,
      });

      setCommittedElementsOverride(nextElements);
      setSelectedPhotoIds([]);
      setIsPhotoPickerVisible(false);

      if (selectedPhotosWithSize.length < photoIdsToAdd.length) {
        Alert.alert(
          translate("recapEditor.loadSomePhotosFailedTitle"),
          translate("recapEditor.loadSomePhotosFailedMessage"),
        );
      }
    } finally {
      setIsAddingSelectedPhotos(false);
    }
  };

  const handleClosePhotoPicker = () => {
    if (isAddingSelectedPhotos) {
      return;
    }

    setSelectedPhotoIds([]);
    setIsPhotoPickerVisible(false);
  };

  const handleSelectStickerAsset = (asset: StickerAsset) => {
    canvasElementSequenceRef.current += 1;
    const insertion = createRecapCanvasAssetInsertion({
      asset,
      id: `recap-${asset.source}-${Date.now()}-${canvasElementSequenceRef.current}`,
      x: Math.max(Math.round(canvasDimensions.width / 2 - 66), 24),
      y: Math.max(Math.round(canvasDimensions.height / 2 - 66), 24),
      zIndex: getNextRecapCanvasElementZIndex(committedElements),
    });
    const { element } = insertion;

    setCommittedElementsOverride(
      upsertRecapCanvasElement(committedElements, element),
    );
    setSelectedElementId(element.id);
    setLongPressedElementId(null);
    setEditingTextElementId(null);
    setEditingWidgetElementId(
      insertion.shouldStartWidgetEditing ? element.id : null,
    );

    if (insertion.shouldClosePicker) {
      setIsStickerPickerVisible(false);
      setStickerPickerSnapIndex(0);
    }
  };

  const handleRegisterStickerFromLibrary = async () => {
    const result = await registerFromLibrary();

    if (result === "failed") {
      Alert.alert(
        translate("stickers.registerFailedTitle"),
        translate("stickers.registerFailedMessage"),
      );
    }
  };

  const handleRegisterStickerFromClipboard = async () => {
    const result = await registerFromClipboard();

    if (result === "empty") {
      Alert.alert(
        translate("stickers.imageMissingTitle"),
        translate("stickers.clipboardMissingMessage"),
      );
      return;
    }

    if (result === "denied") {
      Alert.alert(
        translate("stickers.permissionTitle"),
        translate("stickers.clipboardDeniedMessage"),
      );
      return;
    }

    if (result === "nativeModuleUnavailable") {
      Alert.alert(
        translate("stickers.nativeModuleTitle"),
        translate("stickers.nativeModuleMessage"),
      );
      return;
    }

    if (result === "failed") {
      Alert.alert(
        translate("stickers.registerFailedTitle"),
        translate("stickers.registerClipboardFailedMessage"),
      );
    }
  };

  if (status !== "ready") {
    return (
      <View style={styles.screen}>
        <AppSafeAreaView edges={["top"]} variant="inset">
          <AppBar>
            <AppBar.BackAction
              accessibilityLabel={translate("recapEditor.back")}
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
      <View
        style={[
          styles.canvasRegion,
          isConstrainedCanvasAspectRatio && styles.constrainedCanvasRegion,
          isPhotoCalendarVisible && styles.canvasRegionWithPicker,
        ]}
      >
        <View
          style={[
            styles.canvasFrame,
            isConstrainedCanvasAspectRatio && styles.constrainedCanvasFrame,
            {
              height: canvasDimensions.height,
              width: canvasDimensions.width,
            },
          ]}
        >
          <RecapLayoutCanvas
            backgroundColor={
              mode === "layout" ? appColors.white : committedBackgroundColor
            }
            isEditing={mode === "layout"}
            layout={visibleLayout}
            photosById={photosById}
            selectedSlotId={mode === "layout" ? selectedLayoutSlotId : null}
            slotPhotoIds={visibleSlotPhotoIds}
            onSelectSlot={handleSelectLayoutSlot}
          >
            {emptyCanvasMessage ? (
              <Text style={styles.emptyText}>{emptyCanvasMessage}</Text>
            ) : null}
          </RecapLayoutCanvas>
          {mode === "default" ? (
            <>
              <Pressable
                accessibilityLabel={translate("recapEditor.blankCanvas")}
                accessibilityRole="button"
                style={styles.canvasDismissLayer}
                onPress={() => handleSelectElement(null)}
              />
              <RecapCanvasElementStack
                assets={stickers}
                editingTextElementId={editingTextElementId}
                editingWidgetElementId={editingWidgetElementId}
                elements={committedElements}
                monthKey={monthKey}
                photosById={photosById}
                selectedElementId={selectedElementId}
                onChangeElement={handleChangeCanvasElement}
                onChangeTextElement={handleChangeTextElement}
                onEndTextEditing={() => setEditingTextElementId(null)}
                onEndWidgetEditing={() => setEditingWidgetElementId(null)}
                onLongPressElement={handleLongPressElement}
                onRequestPhotoSelection={handleRequestPhotoSelection}
                onSelectElement={handleSelectElement}
                onStartTextEditing={handleStartTextEditing}
                onStartWidgetEditing={handleStartWidgetEditing}
              />
            </>
          ) : null}
        </View>
      </View>
      <AppSafeAreaView
        edges={["top"]}
        pointerEvents="box-none"
        variant="overlay"
      >
        <AppBar pointerEvents="box-none" variant="overlay">
          {mode === "layout" ? (
            <AppBar.Action
              accessibilityLabel={translate("recapEditor.cancelLayout")}
              icon="X"
              onPress={handleCancelLayoutPress}
            />
          ) : (
            <AppBar.BackAction
              accessibilityLabel={translate("recapEditor.back")}
              fallbackHref="/recap"
              onBeforeBack={handleBeforeBackPress}
            />
          )}
          <AppBar.Spacer />
          {mode === "layout" ? (
            <AppBar.Action
              accessibilityLabel={translate("recapEditor.completeLayout")}
              disabled={!isLayoutSelectionComplete}
              icon="Check"
              onPress={handleCompleteLayoutPress}
            />
          ) : (
            <View pointerEvents="box-none" style={styles.appBarActions}>
              {mode === "default" ? (
                <>
                  <ShareCaptureMenu
                    ref={shareCaptureMenuRef}
                    accessibilityLabel={translate("recapEditor.shareButton")}
                    captureHeight={canvasDimensions.height}
                    captureRef={shareCaptureRef}
                    captureWidth={canvasDimensions.width}
                    disabled={
                      !hasCanvasContent ||
                      hasUnsavedDecoratingChanges ||
                      isCanvasLoading ||
                      isCanvasSaving
                    }
                    disabledMessage={
                      !hasCanvasContent
                        ? translate("recapEditor.shareEmpty")
                        : hasUnsavedDecoratingChanges
                          ? translate("recapEditor.shareUnsaved")
                          : undefined
                    }
                    fileName={monthKey}
                    isReady={hasCanvasContent && !hasUnsavedDecoratingChanges}
                    presentation="controller"
                  />
                  <NativeActionMenu
                    accessibilityLabel={translate("common.more")}
                    actions={createRecapMenuActions().map((action) => ({
                      ...action,
                      disabled:
                        action.id === "share" &&
                        (!hasCanvasContent ||
                          hasUnsavedDecoratingChanges ||
                          isCanvasLoading ||
                          isCanvasSaving),
                    }))}
                    onPressAction={(actionId) => {
                      if (actionId === "share") {
                        shareCaptureMenuRef.current?.shareImage();
                        return;
                      }

                      if (actionId === "aspectRatio") {
                        handleOpenCanvasAspectRatioSheet();
                      }
                    }}
                  >
                    <View style={styles.moreMenuTrigger}>
                      <ReiconIcon
                        color={appColors.white}
                        name="More"
                        size={24}
                      />
                    </View>
                  </NativeActionMenu>
                </>
              ) : null}
              <AppBar.Action
                accessibilityLabel={translate("recapEditor.complete")}
                disabled={
                  !hasUnsavedDecoratingChanges ||
                  isCanvasLoading ||
                  isCanvasSaving
                }
                icon="Check"
                onPress={handleCompletePress}
              />
            </View>
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
            canMoveBackward={selectedTextLayerCapabilities.canMoveBackward}
            canMoveForward={selectedTextLayerCapabilities.canMoveForward}
            textElement={selectedTextElement}
            onDelete={handleDeleteSelectedText}
            onOpenColorPicker={() => handleOpenSelectedTextSheet("color")}
            onOpenTypographyPicker={() =>
              handleOpenSelectedTextSheet("typography")
            }
            onMoveBackward={() =>
              handleMoveCanvasElement(selectedTextElement.id, "backward")
            }
            onMoveForward={() =>
              handleMoveCanvasElement(selectedTextElement.id, "forward")
            }
            onUpdateTextStyle={handleUpdateSelectedTextStyle}
          />
        ) : selectedCanvasElement &&
          (selectedCanvasElement.type === "photo" ||
            longPressedElementId === selectedCanvasElement.id) ? (
          <RecapElementLayerToolbar
            canMoveBackward={
              selectedCanvasElementLayerCapabilities.canMoveBackward
            }
            canMoveForward={
              selectedCanvasElementLayerCapabilities.canMoveForward
            }
            onDelete={() => handleDeleteCanvasElement(selectedCanvasElement.id)}
            onCrop={
              selectedCanvasElement.type === "photo"
                ? () => handleTogglePhotoCrop(selectedCanvasElement.id)
                : undefined
            }
            onMoveBackward={() =>
              handleMoveCanvasElement(selectedCanvasElement.id, "backward")
            }
            onMoveForward={() =>
              handleMoveCanvasElement(selectedCanvasElement.id, "forward")
            }
          />
        ) : (
          <RecapDecoratingToolbar
            disabledActionIds={committedLayoutId ? ["background"] : []}
            onSelectAction={handleToolbarActionPress}
          />
        )}
      </View>
      <RecapPhotoCalendarSheet
        monthKey={monthKey}
        photos={photos}
        selectedPhotoIds={
          mode === "layout"
            ? pendingLayoutPhotoId
              ? [pendingLayoutPhotoId]
              : []
            : pendingPolaroidPhotoId
              ? [pendingPolaroidPhotoId]
              : []
        }
        visible={isPhotoCalendarVisible}
        onClose={() => {
          setSelectedLayoutSlotId(null);
          setIsPolaroidPhotoPickerVisible(false);
          setPendingLayoutPhotoId(null);
          setPendingPolaroidPhotoId(null);
        }}
        onChangeSelectedPhotoIds={
          mode === "layout"
            ? handleSelectLayoutPhoto
            : handleSelectPolaroidPhoto
        }
        onComplete={
          mode === "layout"
            ? handleCompleteLayoutPhotoSelection
            : handleCompletePolaroidPhotoSelection
        }
      />
      <RecapPhotoCalendarSheet
        isCompleting={isAddingSelectedPhotos}
        monthKey={monthKey}
        multiple
        photos={photos}
        selectedPhotoIds={selectedPhotoIds}
        visible={isPhotoPickerVisible}
        onClose={handleClosePhotoPicker}
        onChangeSelectedPhotoIds={setSelectedPhotoIds}
        onComplete={handleCompletePhotoSelection}
      />
      {isStickerPickerVisible ? (
        <StickerPickerSheet
          isLoading={isStickerLibraryLoading}
          isRegistering={isStickerLibrarySaving}
          snapIndex={stickerPickerSnapIndex}
          stickers={stickers}
          visible={isStickerPickerVisible}
          onChangeSnapIndex={setStickerPickerSnapIndex}
          onClose={() => {
            setIsStickerPickerVisible(false);
            setStickerPickerSnapIndex(0);
          }}
          onRegisterFromClipboard={() => {
            void handleRegisterStickerFromClipboard();
          }}
          onRegisterFromLibrary={() => {
            void handleRegisterStickerFromLibrary();
          }}
          onSelectSticker={handleSelectStickerAsset}
        />
      ) : null}
      <RecapTextTypographySheet
        fontFamily={textSheetElement?.fontFamily}
        fontSize={textSheetElement?.fontSize ?? DEFAULT_RECAP_TEXT_FONT_SIZE}
        visible={activeTextSheet === "typography"}
        onChangeFontFamily={(fontFamily) =>
          handleUpdateTextSheetElement({ fontFamily })
        }
        onChangeFontSize={(fontSize) =>
          handleUpdateTextSheetElement({ fontSize })
        }
        onClose={handleCloseTextSheet}
      />
      <RecapColorSheet
        title={translate("recapEditor.textColor")}
        value={textSheetElement?.color ?? DEFAULT_RECAP_TEXT_COLOR}
        visible={activeTextSheet === "color"}
        onChangeColor={(color) =>
          handleUpdateTextSheetElement({
            color: normalizeRecapTextColor(color),
          })
        }
        onClose={handleCloseTextSheet}
      />
      <RecapColorSheet
        title={translate("recapEditor.backgroundColor")}
        value={committedBackgroundColor}
        visible={isBackgroundColorSheetVisible}
        onChangeColor={(color) =>
          setCommittedBackgroundColorOverride(
            normalizeRecapCanvasBackgroundColor(color),
          )
        }
        onClose={() => setIsBackgroundColorSheetVisible(false)}
      />
      <RecapCanvasAspectRatioSheet
        required={requiresInitialAspectRatioSelection}
        value={pendingAspectRatio ?? visibleAspectRatio}
        visible={
          isCanvasAspectRatioSheetVisible || requiresInitialAspectRatioSelection
        }
        onCancel={handleCancelCanvasAspectRatio}
        onConfirm={handleConfirmCanvasAspectRatio}
        onSelect={handleSelectCanvasAspectRatio}
        onClose={handleCloseCanvasAspectRatioSheet}
      />
      {hasCanvasContent ? (
        <View
          ref={shareCaptureRef}
          accessibilityElementsHidden
          collapsable={false}
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          renderToHardwareTextureAndroid
          style={[
            styles.shareCaptureCanvas,
            {
              height: canvasDimensions.height,
              transform: [{ translateX: -(canvasDimensions.width + 120) }],
              width: canvasDimensions.width,
            },
          ]}
        >
          <RecapLayoutCanvas
            backgroundColor={committedBackgroundColor}
            isEditing={false}
            layout={committedLayoutDefinition}
            photosById={photosById}
            selectedSlotId={null}
            slotPhotoIds={committedSlotPhotoIds}
            onSelectSlot={() => {}}
          />
          <RecapCanvasElementStack
            assets={stickers}
            editingTextElementId={null}
            editingWidgetElementId={null}
            elements={committedElements}
            monthKey={monthKey}
            photosById={photosById}
            selectedElementId={null}
            onChangeElement={() => {}}
            onChangeTextElement={() => {}}
            onEndTextEditing={() => {}}
            onEndWidgetEditing={() => {}}
            onLongPressElement={() => {}}
            onRequestPhotoSelection={() => {}}
            onSelectElement={() => {}}
            onStartTextEditing={() => {}}
            onStartWidgetEditing={() => {}}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  appBarActions: {
    flexDirection: "row",
    gap: 10,
  },
  moreMenuTrigger: {
    alignItems: "center",
    backgroundColor: appColors.blackOverlay26,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  canvasRegion: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 0,
    position: "relative",
  },
  canvasRegionWithPicker: {
    flex: 3,
  },
  canvasFrame: {
    overflow: "hidden",
    position: "relative",
  },
  constrainedCanvasFrame: {
    borderColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
  },
  constrainedCanvasRegion: {
    backgroundColor: "rgba(18,18,18,0.65)",
  },
  canvasDismissLayer: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: appLayers.canvasElement - 1,
  },
  emptyText: {
    color: "#8C8C8C",
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
    backgroundColor: appColors.white,
    flex: 1,
  },
  shareCaptureCanvas: {
    backgroundColor: appColors.white,
    left: 0,
    position: "absolute",
    top: 0,
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
