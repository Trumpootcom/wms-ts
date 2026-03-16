// src/slicer/imageAdjustments.ts
import type { ImageAdjustments } from "./types.ts";

function clampByte(value: number): number {
  if (value < 0) return 0;
  if (value > 255) return 255;
  return value;
}

export function applyImageAdjustmentsToImageData(
  imageData: ImageData,
  adjustments: ImageAdjustments,
): void {
  const data = imageData.data;

  const brightnessFactor = adjustments.brightness / 100;
  const contrastFactor = adjustments.contrast / 100;
  const saturationFactor = adjustments.saturation / 100;
  const gammaFactor = adjustments.gamma > 0 ? adjustments.gamma : 1;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    r *= brightnessFactor;
    g *= brightnessFactor;
    b *= brightnessFactor;

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

    data[i] = clampByte(r);
    data[i + 1] = clampByte(g);
    data[i + 2] = clampByte(b);
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

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyImageAdjustmentsToImageData(imageData, adjustments);
  ctx.putImageData(imageData, 0, 0);
}