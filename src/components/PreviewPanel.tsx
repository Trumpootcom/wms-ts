import { useLayoutEffect, useRef, useState } from "react";
import type {
  GridColor,
  GridMode,
  GridSize,
  ImageAdjustments,
  SliceEstimate,
  SliceSize,
} from "../slicer/types.ts";
import { buildImageViewRect } from "../slicer/imageView.ts";
import SvgGridLayer from "./ui/SvgGridLayer";
import PanelSection from "./ui/PanelSection.tsx";

type SourceSizeReport = {
  sourceWidthIn: number;
  sourceHeightIn: number;
  stretchX: number;
  stretchY: number;
};

type PreviewPanelProps = {
  imageUrl: string | null;
  printedWidthIn: number;
  printedHeightIn: number;
  gridMode: GridMode;
  gridPerspectiveAngle: number;
  gridRotation: number;
  gridColor: GridColor;
  gridSizeIn: GridSize;
  gridPhaseX?: number;
  gridPhaseY?: number;
  gridLineThickness?: number;
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

function PreviewPanel({
  imageUrl,
  printedWidthIn,
  printedHeightIn,
  gridMode,
  gridPerspectiveAngle,
  gridRotation,
  gridColor,
  gridSizeIn,
  gridPhaseX,
  gridPhaseY,
  gridLineThickness,
  sliceSize,
  sourcePixelWidth,
  sourcePixelHeight,
  imageAdjustments,
  imageZoom,
  imageOffsetX,
  imageOffsetY,
}: PreviewPanelProps) {
  const previewPaddingPx = 5;
  const previewBorderPx = 1;

  const previewMeasureRef = useRef<HTMLDivElement | null>(null);
  const [previewStage, setPreviewStage] = useState({ width: 1, height: 1 });

  useLayoutEffect(() => {
    const node = previewMeasureRef.current;
    if (!node) return;

    const updateSize = () => {
      const nextWidth = Math.max(
        node.clientWidth - previewPaddingPx * 2 - previewBorderPx * 2,
        1
      );
      const nextHeight = Math.max(
        node.clientHeight - previewPaddingPx * 2 - previewBorderPx * 2,
        1
      );

      setPreviewStage((prev) => {
        if (prev.width === nextWidth && prev.height === nextHeight) {
          return prev;
        }

        return {
          width: nextWidth,
          height: nextHeight,
        };
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const sliceLineColor =
    gridColor === "black"
      ? "rgba(220, 38, 38, 0.95)"
      : "rgba(239, 68, 68, 0.95)";

  const imageFilter = `
    brightness(${imageAdjustments.brightness}%)
    contrast(${imageAdjustments.contrast}%)
    saturate(${imageAdjustments.saturation}%)
  `;

  const stageAspect = printedWidthIn / printedHeightIn;

  const stageWidth = Math.max(previewStage.width, 1);
  const stageHeight = Math.max(previewStage.height, 1);

  let frameWidthPx = stageWidth;
  let frameHeightPx = frameWidthPx / stageAspect;

  if (frameHeightPx > stageHeight) {
    frameHeightPx = stageHeight;
    frameWidthPx = frameHeightPx * stageAspect;
  }

  frameWidthPx = Math.floor(frameWidthPx);
  frameHeightPx = Math.floor(frameHeightPx);

  let previewImageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "fill",
    display: "block",
    filter: imageFilter,
  };

  if (sourcePixelWidth && sourcePixelHeight) {
    const viewRect = buildImageViewRect({
      sourceImageWidth: sourcePixelWidth,
      sourceImageHeight: sourcePixelHeight,
      printedWidthIn,
      printedHeightIn,
      imageZoom,
      imageOffsetX,
      imageOffsetY,
    });

    const scaleX = frameWidthPx / viewRect.sourceWidth;
    const scaleY = frameHeightPx / viewRect.sourceHeight;

    previewImageStyle = {
      position: "absolute",
      left: `${-viewRect.sourceX * scaleX}px`,
      top: `${-viewRect.sourceY * scaleY}px`,
      width: `${sourcePixelWidth * scaleX}px`,
      height: `${sourcePixelHeight * scaleY}px`,
      display: "block",
      filter: imageFilter,
      maxWidth: "none",
      maxHeight: "none",
    };
  }

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        minWidth: 0,
      }}
    >
    <PanelSection title="Preview" bodyPadding="0px" fillHeight>
            <div
          ref={previewMeasureRef}
          style={{
            height: "100%",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              height: "100%",
              minHeight: 0,
              minWidth: 0,
              padding: `${previewPaddingPx}px`,
              boxSizing: "border-box",
              display: "grid",
              placeItems: "center",
              border: `${previewBorderPx}px solid #9ca3af`,
              background: "#e5e7eb",
              overflow: "hidden",
            }}
          >
            <div
              id="mapStage"
              style={{
                position: "relative",
                width: `${frameWidthPx}px`,
                height: `${frameHeightPx}px`,
                border: "1px solid #9ca3af",
                background: "#e5e7eb",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {imageUrl ? (
                <div
                  id="image"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={imageUrl}
                    alt="Uploaded map preview"
                    style={previewImageStyle}
                  />

                  <SvgGridLayer
                    printedWidthIn={printedWidthIn}
                    printedHeightIn={printedHeightIn}
                    gridMode={gridMode}
                    gridPerspectiveAngle={gridPerspectiveAngle}
                    gridRotation={gridRotation}
                    gridColor={gridColor}
                    gridSizeIn={gridSizeIn}
                    gridPhaseX={gridPhaseX}
                    gridPhaseY={gridPhaseY}
                    gridLineThickness={gridLineThickness}
                  />

                  <div
                    id="page-slice-overlay"
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      boxSizing: "border-box",
                      border: `2px solid ${sliceLineColor}`,
                      backgroundImage: `
                        linear-gradient(to right, ${sliceLineColor} 2px, transparent 2px),
                        linear-gradient(to bottom, ${sliceLineColor} 2px, transparent 2px)
                      `,
                      backgroundSize: `${(8 / printedWidthIn) * 100}% ${
                        ((sliceSize === "8x10" ? 10 : 10.5) / printedHeightIn) *
                        100
                      }%`,
                      backgroundPosition: "0 0, 0 0",
                      backgroundRepeat: "repeat",
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#4b5563",
                    fontSize: "18px",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(0,0,0,0.04))",
                  }}
                >
                  No image loaded
                </div>
              )}
            </div>
          </div>
        </div>
      </PanelSection>
    </div>
  );
}

export default PreviewPanel;