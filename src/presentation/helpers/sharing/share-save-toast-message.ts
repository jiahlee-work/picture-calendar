export const ShareSaveToastState = {
  failed: "failed",
  hidden: "hidden",
  saved: "saved",
  saving: "saving",
} as const;

export type ShareSaveToastState =
  (typeof ShareSaveToastState)[keyof typeof ShareSaveToastState];

export function toShareSaveToastMessage(state: ShareSaveToastState) {
  if (state === ShareSaveToastState.saving) {
    return "저장 중";
  }

  if (state === ShareSaveToastState.saved) {
    return "이미지를 갤러리에 저장했어요.";
  }

  if (state === ShareSaveToastState.failed) {
    return "이미지를 저장하지 못했어요.";
  }

  return "";
}
