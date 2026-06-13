import type { SliceEstimate, SliceOrientation, SliceSize } from "./types";

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

export function rowLabelFromIndex(index: number): string {
  let n = index + 1;
  let label = "";

  while (n > 0) {
    const rem = (n - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    n = Math.floor((n - 1) / 26);
  }

  return label;
}

export function getTileConfig(
  sliceSize: SliceSize,
  sliceOrientation: SliceOrientation = "portrait",
): {
  widthIn: number;
  heightIn: number;
} {
  let config: { widthIn: number; heightIn: number };

  if (sliceSize === "8x10.5") {
    config = { widthIn: 8, heightIn: 10.5 };
  } else {
    config = { widthIn: 8, heightIn: 10 };
  }

  if (sliceOrientation === "landscape") {
    return {
      widthIn: config.heightIn,
      heightIn: config.widthIn,
    };
  }

  return config;
}

export function buildSliceEstimate(
  printedWidthIn: number,
  printedHeightIn: number,
  sliceSize: SliceSize,
  sliceOrientation: SliceOrientation = "portrait",
): SliceEstimate {
  const tileConfig = getTileConfig(sliceSize, sliceOrientation);

  const cols = Math.ceil(printedWidthIn / tileConfig.widthIn);
  const rows = Math.ceil(printedHeightIn / tileConfig.heightIn);

  const tiles: SliceEstimate["tiles"] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const xIn = col * tileConfig.widthIn;
      const yIn = row * tileConfig.heightIn;

      const widthIn =
        col === cols - 1
          ? roundToTenth(printedWidthIn - col * tileConfig.widthIn)
          : tileConfig.widthIn;

      const heightIn =
        row === rows - 1
          ? roundToTenth(printedHeightIn - row * tileConfig.heightIn)
          : tileConfig.heightIn;

      tiles.push({
        row,
        col,
        xIn,
        yIn,
        widthIn,
        heightIn,
        label: `${rowLabelFromIndex(row)}${col + 1}`,
      });
    }
  }

  return {
    cols,
    rows,
    total: cols * rows,
    tiles,
  };
}

export function getPreviewStageSize(
  printedWidthIn: number,
  printedHeightIn: number,
  maxWidthPx: number,
  maxHeightPx: number,
): { width: number; height: number } {
  const aspect = printedWidthIn / printedHeightIn;

  let width = maxWidthPx;
  let height = width / aspect;

  if (height > maxHeightPx) {
    height = maxHeightPx;
    width = height * aspect;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}
