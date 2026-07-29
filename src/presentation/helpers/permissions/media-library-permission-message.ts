export function toMediaLibraryPermissionMessage(canAskAgain: boolean) {
  if (canAskAgain) {
    return "이미지를 갤러리에 저장하려면 사진 저장 권한이 필요해요.";
  }

  return "사진 저장 권한이 꺼져 있어 이미지를 저장할 수 없어요. 설정에서 권한을 허용해 주세요.";
}
