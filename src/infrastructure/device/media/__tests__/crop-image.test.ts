import ImageCropPicker from "react-native-image-crop-picker";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { cropImage } from "@/infrastructure/device/media/crop-image";
import { loadImageDimensions } from "@/infrastructure/device/media/load-image-dimensions";

vi.mock("react-native-image-crop-picker", () => ({
  default: {
    openCropper: vi.fn(),
  },
}));

vi.mock("@/infrastructure/device/media/load-image-dimensions", () => ({
  loadImageDimensions: vi.fn(),
}));

const mockOpenCropper = vi.mocked(ImageCropPicker.openCropper);
const mockLoadImageDimensions = vi.mocked(loadImageDimensions);

describe("cropImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts from the original aspect ratio and preserves output quality", async () => {
    mockLoadImageDimensions.mockResolvedValue({ height: 4032, width: 3024 });
    mockOpenCropper.mockResolvedValue({
      height: 3200,
      mime: "image/jpeg",
      path: "file:///cropped-photo.jpg",
      size: 4_800_000,
      width: 2400,
    });

    await expect(cropImage("file:///original-photo.jpg")).resolves.toEqual({
      height: 3200,
      uri: "file:///cropped-photo.jpg",
      width: 2400,
    });
    expect(mockOpenCropper).toHaveBeenCalledWith({
      avoidEmptySpaceAroundImage: true,
      compressImageQuality: 1,
      freeStyleCropEnabled: true,
      height: 4032,
      mediaType: "photo",
      path: "file:///original-photo.jpg",
      width: 3024,
    });
  });

  it("does not open the cropper when the source dimensions cannot be loaded", async () => {
    mockLoadImageDimensions.mockResolvedValue(null);

    await expect(cropImage("file:///missing-photo.jpg")).rejects.toThrow(
      "Unable to load image dimensions before cropping.",
    );
    expect(mockOpenCropper).not.toHaveBeenCalled();
  });

  it("returns null when the user cancels cropping", async () => {
    mockLoadImageDimensions.mockResolvedValue({ height: 4032, width: 3024 });
    mockOpenCropper.mockRejectedValue({ code: "E_PICKER_CANCELLED" });

    await expect(cropImage("file:///original-photo.jpg")).resolves.toBeNull();
  });
});
