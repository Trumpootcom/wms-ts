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

function srgbToLinear(value: number): number {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function linearToSrgb(value: number): number {
  const channel = Math.min(Math.max(value, 0), 1);
  return 255 * (channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055);
}

function linearRgbToOklab(r: number, g: number, b: number) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function oklabToLinearRgb(l: number, a: number, b: number) {
  const lRoot = l + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = l - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = l - 0.0894841775 * a - 1.291485548 * b;
  const ll = lRoot * lRoot * lRoot;
  const mm = mRoot * mRoot * mRoot;
  const ss = sRoot * sRoot * sRoot;
  return {
    r: 4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss,
    g: -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss,
    b: -0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss,
  };
}

function gamutMappedOklabToLinearRgb(l: number, a: number, b: number) {
  const isInGamut = (rgb: { r: number; g: number; b: number }) =>
    rgb.r >= 0 && rgb.r <= 1 && rgb.g >= 0 && rgb.g <= 1 && rgb.b >= 0 && rgb.b <= 1;
  const direct = oklabToLinearRgb(l, a, b);
  if (isInGamut(direct)) return direct;

  let low = 0;
  let high = 1;
  let best = oklabToLinearRgb(l, 0, 0);
  for (let iteration = 0; iteration < 7; iteration += 1) {
    const scale = (low + high) / 2;
    const candidate = oklabToLinearRgb(l, a * scale, b * scale);
    if (isInGamut(candidate)) {
      low = scale;
      best = candidate;
    } else {
      high = scale;
    }
  }
  return best;
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
  const vibrance = Math.min(Math.max(adjustments.vibrance ?? 0, -100), 100) / 100;
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
  const levelsBlack = Math.min(Math.max(adjustments.levelsBlack ?? 0, 0), 127);
  const levelsWhite = Math.min(Math.max(adjustments.levelsWhite ?? 255, 128), 255);

  for (let i = 0; i < data.length; i += 4) {
    const lightFactor = brightnessFactor * exposureFactor;
    const lab = linearRgbToOklab(
      srgbToLinear(data[i]) * lightFactor,
      srgbToLinear(data[i + 1]) * lightFactor,
      srgbToLinear(data[i + 2]) * lightFactor,
    );

    let lightness = ((lab.l * 255 - levelsBlack) / (levelsWhite - levelsBlack));
    lightness = (lightness - 0.5) * contrastFactor + 0.5;
    lightness = Math.pow(Math.min(Math.max(lightness, 0), 1), 1 / gammaFactor);
    lightness += (shadows * IMAGE_ADJUSTMENT_CONFIG.shadows.strength / 255) * Math.pow(1 - lightness, 2)
      + (highlights * IMAGE_ADJUSTMENT_CONFIG.highlights.strength / 255) * Math.pow(lightness, 2);
    lightness = toneCurveLookup[curveLookup[Math.round(clampByte(lightness * 255))]] / 255;

    const chroma = Math.hypot(lab.a, lab.b);
    const normalizedChroma = Math.min(chroma / 0.4, 1);
    const vibranceFactor = vibrance >= 0 ? 1 + vibrance * (1 - normalizedChroma) : 1 + vibrance;
    const chromaFactor = saturationFactor * vibranceFactor;
    const rgb = gamutMappedOklabToLinearRgb(
      Math.min(Math.max(lightness, 0), 1),
      lab.a * chromaFactor,
      lab.b * chromaFactor,
    );

    data[i] = linearToSrgb(rgb.r);
    data[i + 1] = linearToSrgb(rgb.g);
    data[i + 2] = linearToSrgb(rgb.b);
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
