import { jsPDF } from "jspdf";
import { drawCornerGrid, drawDashedGrid, drawLineGrid } from "./grid.ts";
import type { GridColor, GridMode, SliceEstimate, SliceSize } from "./types.ts";
import { drawAdjustedSliceToCanvas } from "./imageAdjustments.ts";
import type { ImageAdjustments } from "./types.ts";

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
  imageAdjustments: ImageAdjustments;
  exportDpi: number;
  onProgress?: (message: string) => void;
};

export async function exportSlicedPdf({
  imageUrl,
  printedWidthIn,
  printedHeightIn,
  sliceSize,
  sliceEstimate,
  gridMode,
  gridColor,
  gridSizeIn,
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
  const exportGridLineColor = gridColor === "black" ? "#000000" : "#ffffff";

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

    const sx = (tile.xIn / printedWidthIn) * sourceImage.width;
    const sy = (tile.yIn / printedHeightIn) * sourceImage.height;
    const sw = (tile.widthIn / printedWidthIn) * sourceImage.width;
    const sh = (tile.heightIn / printedHeightIn) * sourceImage.height;
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


    if (gridMode === "line") {
      drawLineGrid(
        ctx,
        tileWidthPx,
        tileHeightPx,
        tile.xIn,
        tile.yIn,
        tile.widthIn,
        tile.heightIn,
        gridSizeIn,
        exportDpi,
        exportGridLineColor,
      );
    } else if (gridMode === "dash") {
      drawDashedGrid(
        ctx,
        tileWidthPx,
        tileHeightPx,
        tile.xIn,
        tile.yIn,
        tile.widthIn,
        tile.heightIn,
        gridSizeIn,
        exportDpi,
        exportGridLineColor,
      );
    } else if (gridMode === "corner") {
      drawCornerGrid(
        ctx,
        tileWidthPx,
        tileHeightPx,
        tile.xIn,
        tile.yIn,
        tile.widthIn,
        tile.heightIn,
        gridSizeIn,
        exportDpi,
        exportGridLineColor,
      );
    }

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
