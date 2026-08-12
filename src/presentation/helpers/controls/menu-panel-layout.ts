export type MenuAnchorFrame = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type MenuPanelPlacement = "bottom" | "top";

type MenuScreen = {
  height: number;
  width: number;
};

type MenuScreenInsets = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

export type MenuPanelLayout = {
  bottom?: number;
  left?: number;
  maxHeight: number;
  maxWidth: number;
  right?: number;
  top?: number;
};

const MENU_PANEL_ANCHOR_GAP = 8;
const MENU_PANEL_SCREEN_MARGIN = 12;

export function getMenuPanelLayout(
  anchor: MenuAnchorFrame,
  screen: MenuScreen,
  insets: MenuScreenInsets,
  placement: MenuPanelPlacement,
): MenuPanelLayout {
  const leftBoundary = Math.max(MENU_PANEL_SCREEN_MARGIN, insets.left);
  const rightBoundary = Math.max(MENU_PANEL_SCREEN_MARGIN, insets.right);
  const topBoundary = Math.max(MENU_PANEL_SCREEN_MARGIN, insets.top);
  const bottomBoundary = Math.max(MENU_PANEL_SCREEN_MARGIN, insets.bottom);
  const shouldAlignLeft = anchor.x + anchor.width / 2 <= screen.width / 2;
  const horizontalLayout = shouldAlignLeft
    ? getLeftAlignedLayout(anchor, screen.width, leftBoundary, rightBoundary)
    : getRightAlignedLayout(anchor, screen.width, leftBoundary, rightBoundary);

  if (placement === "top") {
    const bottom = Math.max(
      bottomBoundary,
      screen.height - anchor.y + MENU_PANEL_ANCHOR_GAP,
    );

    return {
      ...horizontalLayout,
      bottom,
      maxHeight: Math.max(0, screen.height - bottom - topBoundary),
    };
  }

  const top = Math.max(
    topBoundary,
    anchor.y + anchor.height + MENU_PANEL_ANCHOR_GAP,
  );

  return {
    ...horizontalLayout,
    maxHeight: Math.max(0, screen.height - top - bottomBoundary),
    top,
  };
}

function getLeftAlignedLayout(
  anchor: MenuAnchorFrame,
  screenWidth: number,
  leftBoundary: number,
  rightBoundary: number,
) {
  const left = clamp(anchor.x, leftBoundary, screenWidth - rightBoundary);

  return {
    left,
    maxWidth: Math.max(0, screenWidth - left - rightBoundary),
  };
}

function getRightAlignedLayout(
  anchor: MenuAnchorFrame,
  screenWidth: number,
  leftBoundary: number,
  rightBoundary: number,
) {
  const anchorRight = anchor.x + anchor.width;
  const right = clamp(
    screenWidth - anchorRight,
    rightBoundary,
    screenWidth - leftBoundary,
  );

  return {
    maxWidth: Math.max(0, screenWidth - right - leftBoundary),
    right,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
