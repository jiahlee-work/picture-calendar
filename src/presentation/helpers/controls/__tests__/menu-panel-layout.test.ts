import { describe, expect, it } from "vitest";

import { getMenuPanelLayout } from "@/presentation/helpers/controls/menu-panel-layout";

const screen = { height: 874, width: 402 };
const insets = { bottom: 34, left: 0, right: 0, top: 59 };

describe("getMenuPanelLayout", () => {
  it("왼쪽 트리거에서는 왼쪽을 기준으로 배치한다", () => {
    expect(
      getMenuPanelLayout(
        { height: 40, width: 40, x: 24, y: 100 },
        screen,
        insets,
        "bottom",
      ),
    ).toEqual({
      left: 24,
      maxHeight: 692,
      maxWidth: 366,
      top: 148,
    });
  });

  it("오른쪽 트리거에서는 오른쪽을 기준으로 배치한다", () => {
    expect(
      getMenuPanelLayout(
        { height: 40, width: 40, x: 338, y: 100 },
        screen,
        insets,
        "bottom",
      ),
    ).toEqual({
      maxHeight: 692,
      maxWidth: 366,
      right: 24,
      top: 148,
    });
  });

  it("상단 메뉴를 트리거 위에 배치한다", () => {
    expect(
      getMenuPanelLayout(
        { height: 40, width: 40, x: 320, y: 790 },
        screen,
        insets,
        "top",
      ),
    ).toEqual({
      bottom: 92,
      maxHeight: 723,
      maxWidth: 348,
      right: 42,
    });
  });

  it("화면 가장자리 트리거에도 안전 여백을 적용한다", () => {
    expect(
      getMenuPanelLayout(
        { height: 40, width: 40, x: 0, y: 0 },
        screen,
        insets,
        "bottom",
      ),
    ).toEqual({
      left: 12,
      maxHeight: 781,
      maxWidth: 378,
      top: 59,
    });
  });
});
