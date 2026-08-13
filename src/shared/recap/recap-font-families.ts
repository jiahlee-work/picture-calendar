export const RECAP_TEXT_FONT_FAMILY_IDS = [
  "BMKkubulim",
  "BookkGothicBold",
  "BookkGothicLight",
  "BookkMyungjoBold",
  "BookkMyungjoLight",
  "ChosunCentennial",
  "ChosunGu",
  "ChosunNm",
  "GmarketSansBold",
  "GmarketSansLight",
  "GmarketSansRegular",
  "GriunFromsol",
  "GriunXHangeulOchungiKim",
  "Isayoon",
  "Jalnan2",
  "Jejudoldam",
  "KimWildgagBold",
  "MaruBuriBold",
  "MaruBuriLight",
  "MaruBuriRegular",
  "Mona12Bold",
  "Mona12Regular",
  "OngleapParkDahyun",
  "PaperlogyBold",
  "PaperlogyLight",
  "PaperlogyRegular",
  "PretendardBold",
  "PretendardLight",
  "PretendardRegular",
  "YoonChildfundkoreaManSeh",
] as const;

export type RecapTextFontFamily = (typeof RECAP_TEXT_FONT_FAMILY_IDS)[number];

export const RECAP_TEXT_FONT_FAMILIES = new Set<string>([
  ...RECAP_TEXT_FONT_FAMILY_IDS,
  // Keep normalizing fonts from older saved recap data.
  "Georgia",
  "Avenir Next",
  "Menlo",
]);
