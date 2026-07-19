// src/slicer/imageAdjustments.ts
import type { ImageAdjustments } from "./types.ts";
import { IMAGE_ADJUSTMENT_CONFIG } from "./imageAdjustmentConfig.ts";

function clampByte(value: number): number {
  if (value < 0) return 0;
  if (value > 255) return 255;
  return value;
}

function buildCurveLookup(input: number, output: number): Uint8ClampedArray {
  const curveInput = Math.round(clampByte(input));
  const curveOutput = Math.round(clampByte(output));
  const lookup = new Uint8ClampedArray(256);

  for (let value = 0; value <= 255; value += 1) {
    if (value <= curveInput) {
      lookup[value] =
        curveInput === 0 ? curveOutput : (value / curveInput) * curveOutput;
    } else {
      lookup[value] =
        curveInput === 255
          ? curveOutput
          : curveOutput +
            ((value - curveInput) / (255 - curveInput)) *
              (255 - curveOutput);
    }
  }

  return lookup;
}

export function evaluateToneCurve(input: number, output: number, value: number): number {
  const x = Math.min(Math.max(input / 255, 0.001), 0.999);
  const y = Math.min(Math.max(output / 255, 0), 1);
  const targetX = Math.min(Math.max(value / 255, 0), 1);

  function cubic(start: number, control1: number, control2: number, end: number, t: number): number {
    const inverse = 1 - t;
    return inverse * inverse * inverse * start
      + 3 * inverse * inverse * t * control1
      + 3 * inverse * t * t * control2
      + t * t * t * end;
  }

  let x0: number;
  let y0: number;
  let x1: number;
  let y1: number;
  let x2: number;
  let y2: number;
  let x3: number;
  let y3: number;

  if (targetX <= x) {
    const handle = Math.min(x, y) * 0.4;
    x0 = 0; y0 = 0;
    x1 = 0; y1 = 0;
    x2 = x - handle; y2 = y - handle;
    x3 = x; y3 = y;
  } else {
    const handle = Math.min(1 - x, 1 - y) * 0.4;
    x0 = x; y0 = y;
    x1 = x + handle; y1 = y + handle;
    x2 = 1; y2 = 1;
    x3 = 1; y3 = 1;
  }

  let low = 0;
  let high = 1;
  for (let iteration = 0; iteration < 14; iteration += 1) {
    const middle = (low + high) / 2;
    if (cubic(x0, x1, x2, x3, middle) < targetX) low = middle;
    else high = middle;
  }
  const curveT = (low + high) / 2;
  const result = cubic(y0, y1, y2, y3, curveT);
  return Math.min(Math.max(result * 255, 0), 255);
}

function buildToneCurveLookup(input: number, output: number): Uint8ClampedArray {
  const lookup = new Uint8ClampedArray(256);
  for (let value = 0; value <= 255; value += 1) {
    lookup[value] = evaluateToneCurve(input, output, value);
  }
  return lookup;
}

export function applyImageAdjustmentsToImageData(
  imageData: ImageData,
  adjustments: ImageAdjustments,
): void {
  const data = imageData.data;

  const brightnessFactor = adjustments.brightness / 100;
  const exposureFactor = Math.pow(2, adjustments.exposure ?? 0);
  const contrastFactor = adjustments.contrast / 100;
  const saturationFactor = adjustments.saturation / 100;
  const gammaFactor = adjustments.gamma > 0 ? adjustments.gamma : 1;
  const shadowLift = Math.min(Math.max(adjustments.shadowLift ?? 0, 0), 100);
  const shadowInput = 64;
  const shadowOutput = shadowInput + shadowLift * 1.6;
  const curveLookup = buildCurveLookup(shadowInput, shadowOutput);
  const toneCurveLookup = buildToneCurveLookup(
    adjustments.curveInput ?? 128,
    adjustments.curveOutput ?? 128,
  );
  const shadows = Math.min(Math.max(adjustments.shadows ?? IMAGE_ADJUSTMENT_CONFIG.shadows.neutral, IMAGE_ADJUSTMENT_CONFIG.shadows.min), IMAGE_ADJUSTMENT_CONFIG.shadows.max);
  const highlights = Math.min(Math.max(adjustments.highlights ?? IMAGE_ADJUSTMENT_CONFIG.highlights.neutral, IMAGE_ADJUSTMENT_CONFIG.highlights.min), IMAGE_ADJUSTMENT_CONFIG.highlights.max);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    r *= brightnessFactor * exposureFactor;
    g *= brightnessFactor * exposureFactor;
    b *= brightnessFactor * exposureFactor;

    // Contrast
    r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255;
    g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255;
    b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255;

    // Saturation
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = gray + (r - gray) * saturationFactor;
    g = gray + (g - gray) * saturationFactor;
    b = gray + (b - gray) * saturationFactor;

    // Gamma
    r = 255 * Math.pow(clampByte(r) / 255, 1 / gammaFactor);
    g = 255 * Math.pow(clampByte(g) / 255, 1 / gammaFactor);
    b = 255 * Math.pow(clampByte(b) / 255, 1 / gammaFactor);

    // Tonal-range adjustments preserve the opposite end of the histogram.
    const luminance = clampByte(0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const tonalOffset = shadows * IMAGE_ADJUSTMENT_CONFIG.shadows.strength * Math.pow(1 - luminance, 2)
      + highlights * IMAGE_ADJUSTMENT_CONFIG.highlights.strength * Math.pow(luminance, 2);
    r += tonalOffset;
    g += tonalOffset;
    b += tonalOffset;

    data[i] = toneCurveLookup[curveLookup[Math.round(clampByte(r))]];
    data[i + 1] = toneCurveLookup[curveLookup[Math.round(clampByte(g))]];
    data[i + 2] = toneCurveLookup[curveLookup[Math.round(clampByte(b))]];
  }
}

export function drawAdjustedSliceToCanvas(args: {
  canvas: HTMLCanvasElement;
  image: CanvasImageSource;
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  destWidth: number;
  destHeight: number;
  adjustments: ImageAdjustments;
}): void {
  const {
    canvas,
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    destWidth,
    destHeight,
    adjustments,
  } = args;

  canvas.width = Math.round(destWidth);
  canvas.height = Math.round(destHeight);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Could not get 2D context for slice canvas.");
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const perspective = Math.min(Math.max(
    adjustments.perspective ?? IMAGE_ADJUSTMENT_CONFIG.perspective.neutral,
    IMAGE_ADJUSTMENT_CONFIG.perspective.min,
  ), IMAGE_ADJUSTMENT_CONFIG.perspective.max);

  if (perspective === 0) {
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
  } else {
    const strength = Math.abs(perspective);
    for (let row = 0; row < canvas.height; row += 1) {
      const verticalPosition = canvas.height <= 1 ? 0 : row / canvas.height;
      const edgeWeight = perspective > 0 ? 1 - verticalPosition : verticalPosition;
      const inset = IMAGE_ADJUSTMENT_CONFIG.perspective.maxInset * strength * edgeWeight;
      ctx.drawImage(
        image,
        sourceX + sourceWidth * inset,
        sourceY + sourceHeight * verticalPosition,
        sourceWidth * (1 - inset * 2),
        sourceHeight / canvas.height,
        0,
        row,
        canvas.width,
        1,
      );
    }
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyImageAdjustmentsToImageData(imageData, adjustments);
  ctx.putImageData(imageData, 0, 0);
}
