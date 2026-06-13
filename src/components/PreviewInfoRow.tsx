import PanelSection from "./ui/PanelSection.tsx";
import { theme } from "../theme.ts";
import type {
  GridColor,
  GridMode,
  GridSize,
  ImageAdjustments,
  SliceEstimate,
  SliceSize,
} from "../slicer/types.ts";
import { formatInches, formatPercent } from "../utils/format.ts";

type SourceSizeReport = {
  sourceWidthIn: number;
  sourceHeightIn: number;
  stretchX: number;
  stretchY: number;
};

type PreviewInfoRowProps = {
  printedWidthIn: number;
  printedHeightIn: number;
  gridMode: GridMode;
  gridColor: GridColor;
  gridSizeIn: GridSize;
  sliceSize: SliceSize;
  sliceEstimate: SliceEstimate;
  sourceSizeReport: SourceSizeReport | null;
  sourcePixelWidth: number | null;
  sourcePixelHeight: number | null;
  exportDpi: number;
  imageAdjustments: ImageAdjustments;
  imageZoom: number;
  imageOffsetX: number;
  imageOffsetY: number;
};

function PreviewInfoRow({
  printedWidthIn,
  printedHeightIn,
  gridMode,
  gridColor,
  gridSizeIn,
  sliceSize,
  sliceEstimate,
  sourceSizeReport,
  sourcePixelWidth,
  sourcePixelHeight,
  exportDpi,
  imageAdjustments,
  imageZoom,
  imageOffsetX,
  imageOffsetY,
}: PreviewInfoRowProps) {
  const mapWidthFt = (printedWidthIn / gridSizeIn) * 5;
  const mapHeightFt = (printedHeightIn / gridSizeIn) * 5;

  const gridModeLabel = gridMode.charAt(0).toUpperCase() + gridMode.slice(1);
  const sliceSizeLabel = sliceSize === "8x10" ? "8 × 10" : "8 × 10.5";

  const gridWidthCount = printedWidthIn / gridSizeIn;
  const gridHeightCount = printedHeightIn / gridSizeIn;

  return (
    <div
      style={{
        minHeight: 0,
        minWidth: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "8px",
      }}
    >
      <PanelSection title="Image Info" marginBottom="0px">
        <div
          style={{
            color: theme.panel.mutedText,
            lineHeight: 1.5,
            fontSize: "14px",
          }}
        >
          {sourcePixelWidth && sourcePixelHeight && (
            <div>
              Pixels: {sourcePixelWidth} × {sourcePixelHeight}
            </div>
          )}

          {sourceSizeReport && (
            <div>
              Crop fit: {formatInches(sourceSizeReport.sourceWidthIn)}" ×{" "}
              {formatInches(sourceSizeReport.sourceHeightIn)}"
            </div>
          )}

          <div>Zoom: {imageZoom}%</div>
          <div>Offset X: {imageOffsetX}</div>
          <div>Offset Y: {imageOffsetY}</div>
          <div>Brightness: {imageAdjustments.brightness}</div>
          <div>Contrast: {imageAdjustments.contrast}</div>
          <div>Saturation: {imageAdjustments.saturation}</div>
          <div>Gamma: {imageAdjustments.gamma}</div>
        </div>
      </PanelSection>

      <PanelSection title="Map Info" marginBottom="0px">
        <div
          style={{
            color: theme.panel.mutedText,
            lineHeight: 1.5,
            fontSize: "14px",
          }}
        >
          <div>
            Target: {formatInches(printedWidthIn)}" ×{" "}
            {formatInches(printedHeightIn)}"
          </div>

          {sourceSizeReport && (
            <div>
              Stretch: {formatPercent(sourceSizeReport.stretchX)}% H,{" "}
              {formatPercent(sourceSizeReport.stretchY)}% V
            </div>
          )}

          <div>
            Grid: {gridModeLabel}, {gridColor}, {gridSizeIn}"
          </div>

          <div>
            Grid count: {formatInches(gridWidthCount)} ×{" "}
            {formatInches(gridHeightCount)}
          </div>

          <div>
            Map size: {formatInches(mapWidthFt)} ft ×{" "}
            {formatInches(mapHeightFt)} ft
          </div>
        </div>
      </PanelSection>

      <PanelSection title="PDF Info" marginBottom="0px">
        <div
          style={{
            color: theme.panel.mutedText,
            lineHeight: 1.5,
            fontSize: "14px",
          }}
        >
          <div>Slice format: {sliceSizeLabel}</div>
          <div>
            Page array: {sliceEstimate.cols} × {sliceEstimate.rows}
          </div>
          <div>Total pages: {sliceEstimate.total}</div>
          <div>Export DPI: {exportDpi}</div>
        </div>
      </PanelSection>
    </div>
  );
}

export default PreviewInfoRow;
