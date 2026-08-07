const WIDGET_POLAROID_PREVIEW_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="360" height="260" viewBox="0 0 360 260">
    <defs>
      <linearGradient id="background" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#FF4F8B" />
        <stop offset="1" stop-color="#FFD166" />
      </linearGradient>
    </defs>
    <rect width="360" height="260" fill="url(#background)" />
    <circle cx="78" cy="70" r="52" fill="#253047" opacity="0.18" />
    <circle cx="304" cy="94" r="72" fill="#ffffff" opacity="0.25" />
  </svg>
`;

export const widgetPolaroidPreviewImageUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  WIDGET_POLAROID_PREVIEW_SVG,
)}`;
