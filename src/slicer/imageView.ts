export type ImageViewRect = {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
};

type BuildImageViewRectArgs = {
  sourceImageWidth: number;
  sourceImageHeight: number;
  printedWidthIn: number;
  printedHeightIn: number;
  imageZoom: number;      // 100..200
  imageOffsetX: number;   // -100..100
  imageOffsetY: number;   // -100..100
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function buildImageViewRect({
  sourceImageWidth,
  sourceImageHeight,
  printedWidthIn,
  printedHeightIn,
  imageZoom,
  imageOffsetX,
  imageOffsetY,
}: BuildImageViewRectArgs): ImageViewRect {
  const sourceAspect = sourceImageWidth / sourceImageHeight;
  const printedAspect = printedWidthIn / printedHeightIn;

  let baseWidth: number;
  let baseHeight: number;

  // Cover fit: choose the largest centered source rect that matches the
  // printed aspect ratio without stretching.
  if (sourceAspect > printedAspect) {
    baseHeight = sourceImageHeight;
    baseWidth = baseHeight * printedAspect;
  } else {
    baseWidth = sourceImageWidth;
    baseHeight = baseWidth / printedAspect;
  }

  const zoomFactor = imageZoom / 100;

  // Zooming in means we see a smaller source rect.
  const viewWidth = baseWidth / zoomFactor;
  const viewHeight = baseHeight / zoomFactor;

  const centerX = sourceImageWidth / 2;
  const centerY = sourceImageHeight / 2;

  // Pan should be based on the full hidden content relative to the current
  // visible rect, not only the extra crop introduced by zoom.
  const maxOffsetX = Math.max(0, (sourceImageWidth - viewWidth) / 2);
  const maxOffsetY = Math.max(0, (sourceImageHeight - viewHeight) / 2);

  const actualOffsetX = maxOffsetX * (imageOffsetX / 100);
  const actualOffsetY = maxOffsetY * (imageOffsetY / 100);

  const sourceX = clamp(
    centerX + actualOffsetX - viewWidth / 2,
    0,
    sourceImageWidth - viewWidth,
  );

  const sourceY = clamp(
    centerY + actualOffsetY - viewHeight / 2,
    0,
    sourceImageHeight - viewHeight,
  );

  return {
    sourceX,
    sourceY,
    sourceWidth: viewWidth,
    sourceHeight: viewHeight,
  };
}