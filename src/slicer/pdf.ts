import { jsPDF } from "jspdf";
import { buildGridPrimitives } from "./gridPrimitives.ts";
import { buildImageViewRect } from "./imageView.ts";
import type { GridColor, GridMode, SliceEstimate, SliceSize } from "./types.ts";
import { drawAdjustedSliceToCanvas } from "./imageAdjustments.ts";
import type { ImageAdjustments } from "./types.ts";
import { GRID_COLORS } from "./gridConstants.ts";

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for export."));
    img.src = src;
  });
}

export function getPageMargins(sliceSize: SliceSize): {
  left: number;
  top: number;
} {
  if (sliceSize === "8x10.5") {
    return { left: 0.25, top: 0.25 };
  }

  return { left: 0.25, top: 0.5 };
}

type ExportPdfArgs = {
  imageUrl: string;
  printedWidthIn: number;
  printedHeightIn: number;
  sliceSize: SliceSize;
  sliceEstimate: SliceEstimate;
  gridMode: GridMode;
  gridColor: GridColor;
  gridSizeIn: number;
  gridPhaseX?: number;
  gridPhaseY?: number;
  gridLineThickness?: number;
  gridPerspectiveAngle?: number;
  gridRotation?: number;
  imageZoom: number;
  imageOffsetX: number;
  imageOffsetY: number;
  imageAdjustments: ImageAdjustments;
  exportDpi: number;
  onProgress?: (message: string) => void;
};

type PdfLineSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type PdfCircle = {
  cx: number;
  cy: number;
  r: number;
};

function isPointInTile(
  xIn: number,
  yIn: number,
  tileXIn: number,
  tileYIn: number,
  tileWidthIn: number,
  tileHeightIn: number,
): boolean {
  return (
    xIn >= tileXIn &&
    xIn <= tileXIn + tileWidthIn &&
    yIn >= tileYIn &&
    yIn <= tileYIn + tileHeightIn
  );
}

function doesSegmentIntersectTile(
  segment: PdfLineSegment,
  tileXIn: number,
  tileYIn: number,
  tileWidthIn: number,
  tileHeightIn: number,
): boolean {
  const left = tileXIn;
  const right = tileXIn + tileWidthIn;
  const top = tileYIn;
  const bottom = tileYIn + tileHeightIn;

  if (
    isPointInTile(segment.x1, segment.y1, tileXIn, tileYIn, tileWidthIn, tileHeightIn) ||
    isPointInTile(segment.x2, segment.y2, tileXIn, tileYIn, tileWidthIn, tileHeightIn)
  ) {
    return true;
  }

  if (segment.x1 < left && segment.x2 < left) return false;
  if (segment.x1 > right && segment.x2 > right) return false;
  if (segment.y1 < top && segment.y2 < top) return false;
  if (segment.y1 > bottom && segment.y2 > bottom) return false;

  return true;
}

function doesCircleIntersectTile(
  circle: PdfCircle,
  tileXIn: number,
  tileYIn: number,
  tileWidthIn: number,
  tileHeightIn: number,
): boolean {
  const left = tileXIn;
  const right = tileXIn + tileWidthIn;
  const top = tileYIn;
  const bottom = tileYIn + tileHeightIn;

  return !(
    circle.cx + circle.r < left ||
    circle.cx - circle.r > right ||
    circle.cy + circle.r < top ||
    circle.cy - circle.r > bottom
  );
}

function drawGridPrimitivesOnTileCanvas(
  ctx: CanvasRenderingContext2D,
  lineSegments: PdfLineSegment[],
  circles: PdfCircle[],
  tileXIn: number,
  tileYIn: number,
  tileWidthPx: number,
  tileHeightPx: number,
  dpi: number,
  strokeStyle: string,
  strokeWidth: number = 1,
) {
  const tileWidthIn = tileWidthPx / dpi;
  const tileHeightIn = tileHeightPx / dpi;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, tileWidthPx, tileHeightPx);
  ctx.clip();

  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = strokeWidth*2;

  for (const segment of lineSegments) {
    if (
      !doesSegmentIntersectTile(
        segment,
        tileXIn,
        tileYIn,
        tileWidthIn,
        tileHeightIn,
      )
    ) {
      continue;
    }

    ctx.beginPath();
    ctx.moveTo((segment.x1 - tileXIn) * dpi, (segment.y1 - tileYIn) * dpi);
    ctx.lineTo((segment.x2 - tileXIn) * dpi, (segment.y2 - tileYIn) * dpi);
    ctx.stroke();
  }

  for (const circle of circles) {
    if (
      !doesCircleIntersectTile(
        circle,
        tileXIn,
        tileYIn,
        tileWidthIn,
        tileHeightIn,
      )
    ) {
      continue;
    }

    ctx.beginPath();
    ctx.arc(
      (circle.cx - tileXIn) * dpi,
      (circle.cy - tileYIn) * dpi,
      circle.r * dpi,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  ctx.restore();
}

export async function exportSlicedPdf({
  imageUrl,
  printedWidthIn,
  printedHeightIn,
  sliceSize,
  sliceEstimate,
  gridMode,
  gridColor,
  gridSizeIn,
  gridPhaseX,
  gridPhaseY, 
  gridLineThickness = 1,
  gridPerspectiveAngle = 45,
  gridRotation = 0,
  imageZoom,
  imageOffsetX,
  imageOffsetY,
  imageAdjustments,
  exportDpi,
  onProgress,
}: ExportPdfArgs): Promise<void> {
  const sourceImage = await loadImage(imageUrl);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: "letter",
    compress: true,
  });

  const margins = getPageMargins(sliceSize);
  const exportGridLineColor = GRID_COLORS[gridColor] || "rgba(0,0,0,0.95)";

  const { lineSegments, circles } = buildGridPrimitives({
    printedWidthIn,
    printedHeightIn,
    gridMode,
    gridPerspectiveAngle,
    gridRotation,
    gridSizeIn,
    gridPhaseX,
    gridPhaseY,
    dashCount: 4,
  });

  const imageViewRect = buildImageViewRect({
    sourceImageWidth: sourceImage.width,
    sourceImageHeight: sourceImage.height,
    printedWidthIn,
    printedHeightIn,
    imageZoom,
    imageOffsetX,
    imageOffsetY,
  });

  for (let i = 0; i < sliceEstimate.tiles.length; i++) {
    const tile = sliceEstimate.tiles[i];

    onProgress?.(
      `Rendering page ${i + 1} of ${sliceEstimate.tiles.length} (${tile.label})...`,
    );

    if (i > 0) {
      pdf.addPage("letter", "portrait");
    }

    const tileWidthPx = Math.max(1, Math.round(tile.widthIn * exportDpi));
    const tileHeightPx = Math.max(1, Math.round(tile.heightIn * exportDpi));

    const canvas = document.createElement("canvas");
    canvas.width = tileWidthPx;
    canvas.height = tileHeightPx;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not create export canvas.");
    }

    const sx =
      imageViewRect.sourceX +
      (tile.xIn / printedWidthIn) * imageViewRect.sourceWidth;
    const sy =
      imageViewRect.sourceY +
      (tile.yIn / printedHeightIn) * imageViewRect.sourceHeight;
    const sw =
      (tile.widthIn / printedWidthIn) * imageViewRect.sourceWidth;
    const sh =
      (tile.heightIn / printedHeightIn) * imageViewRect.sourceHeight;

    ctx.save();
    drawAdjustedSliceToCanvas({
      canvas: canvas,
      image: sourceImage,
      sourceX: sx,
      sourceY: sy,
      sourceWidth: sw,
      sourceHeight: sh,
      destWidth: tileWidthPx,
      destHeight: tileHeightPx,
      adjustments: imageAdjustments,
    });
    ctx.restore();

    drawGridPrimitivesOnTileCanvas(
      ctx,
      lineSegments,
      circles,
      tile.xIn,
      tile.yIn,
      tileWidthPx,
      tileHeightPx,
      exportDpi,
      exportGridLineColor,
      gridLineThickness,
    );

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);

    pdf.addImage(
      imageDataUrl,
      "JPEG",
      margins.left,
      margins.top,
      tile.widthIn,
      tile.heightIn,
      undefined,
      "FAST",
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text(tile.label, 4.25, 10.88, { align: "center" });
  }

  const safeWidth = String(printedWidthIn).replace(".", "_");
  const safeHeight = String(printedHeightIn).replace(".", "_");
  pdf.save(`vtt_slices_${safeWidth}x${safeHeight}.pdf`);
}