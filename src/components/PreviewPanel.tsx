import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, WheelEvent } from "react";
import type {
  GridColor,
  GridMode,
  GridSize,
  ImageAdjustments,
  SliceOrientation,
  SliceEstimate,
  SliceSize,
} from "../slicer/types.ts";
import { buildImageViewRect } from "../slicer/imageView.ts";
import { getTileConfig } from "../slicer/math.ts";
import { getGridBasis, invert2x2 } from "../slicer/latticeMath.ts";
import { theme } from "../theme.ts";
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
  sliceOrientation: SliceOrientation;
  sliceEstimate: SliceEstimate;
  sourceSizeReport: SourceSizeReport | null;
  sourcePixelWidth: number | null;
  sourcePixelHeight: number | null;
  exportDpi: number;
  imageAdjustments: ImageAdjustments;
  imageZoom: number;
  imageOffsetX: number;
  imageOffsetY: number;
  setImageZoom: (value: number) => void;
  setImageOffsetX: (value: number) => void;
  setImageOffsetY: (value: number) => void;
  setGridSizeIn: (value: GridSize) => void;
  setGridPhaseX: (value: number) => void;
  setGridPhaseY: (value: number) => void;
};

type DragStart = {
  mode: "image" | "grid";
  pointerId: number;
  x: number;
  y: number;
  imageOffsetX: number;
  imageOffsetY: number;
  gridPhaseX: number;
  gridPhaseY: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

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
  sliceOrientation,
  sourcePixelWidth,
  sourcePixelHeight,
  imageAdjustments,
  imageZoom,
  imageOffsetX,
  imageOffsetY,
  setImageZoom,
  setImageOffsetX,
  setImageOffsetY,
  setGridSizeIn,
  setGridPhaseX,
  setGridPhaseY,
}: PreviewPanelProps) {
  const previewPaddingPx = 5;
  const previewBorderPx = 1;

  const previewMeasureRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<DragStart | null>(null);
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
  const tileConfig = getTileConfig(sliceSize, sliceOrientation);

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

  let previewImageStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "fill",
    display: "block",
    filter: imageFilter,
  };
  let imagePanScaleX = 0;
  let imagePanScaleY = 0;

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
    const maxOffsetX = Math.max(0, (sourcePixelWidth - viewRect.sourceWidth) / 2);
    const maxOffsetY = Math.max(
      0,
      (sourcePixelHeight - viewRect.sourceHeight) / 2,
    );

    imagePanScaleX = maxOffsetX > 0 ? 100 / (scaleX * maxOffsetX) : 0;
    imagePanScaleY = maxOffsetY > 0 ? 100 / (scaleY * maxOffsetY) : 0;

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

  function handlePreviewWheel(e: WheelEvent<HTMLDivElement>) {
    e.preventDefault();

    if (e.altKey) {
      const gridStep = e.deltaY < 0 ? 0.1 : -0.1;
      setGridSizeIn(roundToTenth(clamp(gridSizeIn + gridStep, 0.5, 1.5)));
      return;
    }

    if (!imageUrl) return;

    const zoomStepSize = e.shiftKey ? 5 : 1;
    const zoomStep = e.deltaY < 0 ? zoomStepSize : -zoomStepSize;
    setImageZoom(clamp(imageZoom + zoomStep, 100, 200));
  }

  function handleImagePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!imageUrl && !e.altKey) return;

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    dragStartRef.current = {
      mode: e.altKey ? "grid" : "image",
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      imageOffsetX,
      imageOffsetY,
      gridPhaseX: gridPhaseX ?? 0,
      gridPhaseY: gridPhaseY ?? 0,
    };
  }

  function handleImagePointerMove(e: PointerEvent<HTMLDivElement>) {
    const dragStart = dragStartRef.current;

    if (!dragStart || dragStart.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (dragStart.mode === "grid") {
      const deltaPaperX = (deltaX / frameWidthPx) * printedWidthIn;
      const deltaPaperY = (deltaY / frameHeightPx) * printedHeightIn;
      const basis = getGridBasis(
        printedWidthIn,
        printedHeightIn,
        gridPerspectiveAngle,
        gridRotation,
        gridSizeIn,
        dragStart.gridPhaseX,
        dragStart.gridPhaseY,
      );
      const inverse = invert2x2(basis.u.x, basis.u.y, basis.v.x, basis.v.y);

      setGridPhaseX(
        clamp(
          dragStart.gridPhaseX +
            inverse.a11 * deltaPaperX +
            inverse.a12 * deltaPaperY,
          -1,
          1,
        ),
      );
      setGridPhaseY(
        clamp(
          dragStart.gridPhaseY +
            inverse.a21 * deltaPaperX +
            inverse.a22 * deltaPaperY,
          -1,
          1,
        ),
      );
      return;
    }

    setImageOffsetX(
      clamp(dragStart.imageOffsetX - deltaX * imagePanScaleX, -100, 100),
    );
    setImageOffsetY(
      clamp(dragStart.imageOffsetY - deltaY * imagePanScaleY, -100, 100),
    );
  }

  function stopImageDrag(e: PointerEvent<HTMLDivElement>) {
    if (dragStartRef.current?.pointerId === e.pointerId) {
      dragStartRef.current = null;
    }
  }

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "grid",
      }}
    >
      <PanelSection title="Preview" bodyPadding="0px" fillHeight>
        <div
          ref={previewMeasureRef}
          style={{
            height: "100%",
            width: "100%",
            minHeight: 0,
            minWidth: 0,
            padding: `${previewPaddingPx}px`,
            border: `${previewBorderPx}px solid ${theme.preview.border}`,
            background: theme.preview.surface,
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
            boxSizing: "border-box",
            overscrollBehavior: "contain",
            position: "relative",
          }}
          onWheel={handlePreviewWheel}
        >
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              zIndex: 4,
              padding: "4px 8px",
              borderRadius: "4px",
              background: "hsl(42 38% 72% / 48%)",
              color: "hsl(42 35% 16%)",
              fontSize: "12px",
              fontWeight: 700,
              lineHeight: 1.3,
              textAlign: "center",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "max-content max-content",
                columnGap: "12px",
                rowGap: "2px",
                textAlign: "left",
              }}
            >
              <span>SCROLL</span>
              <span>ZOOM IMAGE (SLOW)</span>
              <span>SHIFT-SCROLL</span>
              <span>ZOOM IMAGE (FAST)</span>
              <span>CLICK-DRAG</span>
              <span>PAN IMAGE</span>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              zIndex: 4,
              padding: "4px 8px",
              borderRadius: "4px",
              background: "hsl(42 38% 72% / 48%)",
              color: "hsl(42 35% 16%)",
              fontSize: "12px",
              fontWeight: 700,
              lineHeight: 1.3,
              textAlign: "center",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "max-content max-content",
                columnGap: "12px",
                rowGap: "2px",
                textAlign: "left",
              }}
            >
              <span>ALT-SCROLL</span>
              <span>GRID RESIZE</span>
              <span>ALT-CLICK-DRAG</span>
              <span>GRID PAN</span>
            </div>
          </div>

          <div
            id="mapStage"
            onPointerDown={handleImagePointerDown}
            onPointerMove={handleImagePointerMove}
            onPointerUp={stopImageDrag}
            onPointerCancel={stopImageDrag}
            style={{
              position: "relative",
              width: `${frameWidthPx}px`,
              height: `${frameHeightPx}px`,
              border: `1px solid ${theme.preview.border}`,
              background: theme.preview.surface,
              boxShadow: `0 1px 4px ${theme.preview.shadow}`,
              overflow: "hidden",
              flexShrink: 0,
              cursor: imageUrl ? "move" : "default",
              touchAction: "none",
              userSelect: "none",
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
                    backgroundSize: `${
                      (tileConfig.widthIn / printedWidthIn) * 100
                    }% ${(tileConfig.heightIn / printedHeightIn) * 100}%`,
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
                  color: theme.panel.mutedText,
                  fontSize: "18px",
                  background:
                    `linear-gradient(135deg, ${theme.preview.placeholderStart}, ${theme.preview.placeholderEnd})`,
                }}
              >
                No image loaded
              </div>
            )}
          </div>
        </div>
      </PanelSection>
    </div>
  );
}

export default PreviewPanel;
