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

  // This matches a "cover" fit:
  // use the full printed area, cropping whichever source dimension is extra.
  if (sourceAspect > printedAspect) {
    baseHeight = sourceImageHeight;
    baseWidth = baseHeight * printedAspect;
  } else {
    baseWidth = sourceImageWidth;
    baseHeight = baseWidth / printedAspect;
  }

  const zoomFactor = imageZoom / 100;

  const viewWidth = baseWidth / zoomFactor;
  const viewHeight = baseHeight / zoomFactor;

  const baseCenterX = sourceImageWidth / 2;
  const baseCenterY = sourceImageHeight / 2;

  const maxOffsetX = (baseWidth - viewWidth) / 2;
  const maxOffsetY = (baseHeight - viewHeight) / 2;

  const actualOffsetX = maxOffsetX * (imageOffsetX / 100);
  const actualOffsetY = maxOffsetY * (imageOffsetY / 100);

  const centerX = baseCenterX + actualOffsetX;
  const centerY = baseCenterY + actualOffsetY;

  const sourceX = clamp(centerX - viewWidth / 2, 0, sourceImageWidth - viewWidth);
  const sourceY = clamp(centerY - viewHeight / 2, 0, sourceImageHeight - viewHeight);

  return {
    sourceX,
    sourceY,
    sourceWidth: viewWidth,
    sourceHeight: viewHeight,
  };
}