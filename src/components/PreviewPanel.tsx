import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent, WheelEvent } from "react";
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
import { drawAdjustedSliceToCanvas, evaluateToneCurve } from "../slicer/imageAdjustments.ts";
import { getTileConfig } from "../slicer/math.ts";
import { getGridBasis, invert2x2 } from "../slicer/latticeMath.ts";
import { theme } from "../theme.ts";
import { IMAGE_ADJUSTMENT_CONFIG } from "../slicer/imageAdjustmentConfig.ts";
import {
  snapLinear,
  snapPeriodic,
  VECTOR_CONTROL_CONFIG,
} from "../slicer/vectorControlConfig.ts";
import SvgGridLayer from "./ui/SvgGridLayer";

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
  hideGestureGuidance?: boolean;
  touchInteractionMode?: "image" | "grid";
  bare?: boolean;
  curveEditorOpen?: boolean;
  onCurveChange?: (input: number, output: number) => void;
  onCurveCommit?: () => void;
  brightnessContrastEditorOpen?: boolean;
  onBrightnessContrastChange?: (exposure: number, contrast: number) => void;
  onBrightnessContrastCommit?: () => void;
  shadowsHighlightsEditorOpen?: boolean;
  onShadowsHighlightsChange?: (shadows: number, highlights: number) => void;
  onShadowsHighlightsCommit?: () => void;
  perspectiveEditorOpen?: boolean;
  onPerspectiveChange?: (perspective: number) => void;
  onPerspectiveCommit?: () => void;
  saturationVibranceEditorOpen?: boolean;
  onSaturationVibranceChange?: (saturation: number, vibrance: number) => void;
  onSaturationVibranceCommit?: () => void;
  levelsEditorOpen?: boolean;
  onLevelsChange?: (black: number, white: number) => void;
  onLevelsCommit?: () => void;
  gammaEditorOpen?: boolean;
  onGammaChange?: (gamma: number) => void;
  onGammaCommit?: () => void;
  gridRotationEditorOpen?: boolean;
  onGridRotationChange?: (rotation: number) => void;
  onGridRotationCommit?: () => void;
  gridColorEditorOpen?: boolean;
  onGridColorChange?: (color: GridColor, hue: number, lightness: number) => void;
  onGridColorCommit?: () => void;
  gridThicknessEditorOpen?: boolean;
  onGridThicknessChange?: (thickness: number) => void;
  onGridThicknessCommit?: () => void;
  gridScaleEditorOpen?: boolean;
  onGridScaleChange?: (scale: GridSize) => void;
  onGridScaleCommit?: () => void;
  gridIsoEditorOpen?: boolean;
  onGridIsoChange?: (angle: number) => void;
  onGridIsoCommit?: () => void;
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

type PinchStart = {
  mode: "image" | "grid";
  distance: number;
  imageZoom: number;
  gridSizeIn: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function gridScaleFromMagnitude(magnitude: number): GridSize {
  const config = VECTOR_CONTROL_CONFIG.gridScale;
  const rawScale = clamp(
    magnitude * config.magnitudeMultiplier,
    config.min,
    config.max,
  );
  const scale = rawScale <= config.analogStart
    ? snapLinear(rawScale, config.targets)
    : roundToTenth(rawScale);
  return scale as GridSize;
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
  hideGestureGuidance = false,
  touchInteractionMode = "image",
  bare = false,
  curveEditorOpen = false,
  onCurveChange,
  onCurveCommit,
  brightnessContrastEditorOpen = false,
  onBrightnessContrastChange,
  onBrightnessContrastCommit,
  shadowsHighlightsEditorOpen = false,
  onShadowsHighlightsChange,
  onShadowsHighlightsCommit,
  perspectiveEditorOpen = false,
  onPerspectiveChange,
  onPerspectiveCommit,
  saturationVibranceEditorOpen = false,
  onSaturationVibranceChange,
  onSaturationVibranceCommit,
  levelsEditorOpen = false,
  onLevelsChange,
  onLevelsCommit,
  gammaEditorOpen = false,
  onGammaChange,
  onGammaCommit,
  gridRotationEditorOpen = false,
  onGridRotationChange,
  onGridRotationCommit,
  gridColorEditorOpen = false,
  onGridColorChange,
  onGridColorCommit,
  gridThicknessEditorOpen = false,
  onGridThicknessChange,
  onGridThicknessCommit,
  gridScaleEditorOpen = false,
  onGridScaleChange,
  onGridScaleCommit,
  gridIsoEditorOpen = false,
  onGridIsoChange,
  onGridIsoCommit,
}: PreviewPanelProps) {
  const previewPaddingPx = 5;
  const previewBorderPx = 1;

  const previewMeasureRef = useRef<HTMLDivElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStartRef = useRef<DragStart | null>(null);
  const activePointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartRef = useRef<PinchStart | null>(null);
  const [touchMode, setTouchMode] = useState<"image" | "grid">(
    touchInteractionMode,
  );
  const [previewStage, setPreviewStage] = useState({ width: 1, height: 1 });
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [gammaPointer, setGammaPointer] = useState({ x: 100, y: 100 });
  const [levelsPointer, setLevelsPointer] = useState({ x: 100, y: 100 });
  const [gridRotationPointer, setGridRotationPointer] = useState<{ x: number; y: number } | null>(null);
  const gridRotationDragRef = useRef<{ startAngle: number; startRotation: number } | null>(null);
  const [gridColorPointer, setGridColorPointer] = useState<{ x: number; y: number } | null>(null);
  const [gridThicknessPointer, setGridThicknessPointer] = useState({ x: 100, y: 100 });
  const gridThicknessWasOpenRef = useRef(false);
  const [gridScalePointer, setGridScalePointer] = useState({ x: 100, y: 100 });
  const gridScaleWasOpenRef = useRef(false);
  const [gridIsoPointer, setGridIsoPointer] = useState({ x: 100, y: 100 });
  const gridIsoWasOpenRef = useRef(false);
  const imageAdjustmentsRef = useRef(imageAdjustments);

  useEffect(() => {
    imageAdjustmentsRef.current = imageAdjustments;
  }, [imageAdjustments]);

  useEffect(() => {
    setTouchMode(touchInteractionMode);
  }, [touchInteractionMode]);

  useEffect(() => {
    if (gridRotationEditorOpen) setGridRotationPointer(null);
  }, [gridRotationEditorOpen]);

  useEffect(() => {
    if (gridColorEditorOpen) setGridColorPointer(null);
  }, [gridColorEditorOpen]);

  useEffect(() => {
    if (gridThicknessEditorOpen && !gridThicknessWasOpenRef.current) {
      const displacement = clamp((gridLineThickness ?? 1) - 1, 0, 9) / 9;
      setGridThicknessPointer({ x: 100 + displacement * 100, y: 100 });
    }
    gridThicknessWasOpenRef.current = gridThicknessEditorOpen;
  }, [gridThicknessEditorOpen, gridLineThickness]);

  useEffect(() => {
    if (gridScaleEditorOpen && !gridScaleWasOpenRef.current) {
      const scale = clamp(gridSizeIn, 0.5, 2);
      const magnitude = scale === 0.5 ? 0.25 : scale === 0.75 ? 0.375 : scale / 2;
      const angle = gridRotation * Math.PI / 180;
      setGridScalePointer({
        x: 100 + Math.cos(angle) * magnitude * 100,
        y: 100 + Math.sin(angle) * magnitude * 100,
      });
    }
    gridScaleWasOpenRef.current = gridScaleEditorOpen;
  }, [gridScaleEditorOpen, gridSizeIn, gridRotation]);

  useEffect(() => {
    if (gridIsoEditorOpen && !gridIsoWasOpenRef.current) {
      setGridIsoPointer({ x: 100, y: 100 });
    }
    gridIsoWasOpenRef.current = gridIsoEditorOpen;
  }, [gridIsoEditorOpen]);

  useEffect(() => {
    if (gammaEditorOpen) {
      const gamma = imageAdjustmentsRef.current.gamma;
      const config = IMAGE_ADJUSTMENT_CONFIG.gamma;
      const displacement = gamma >= config.neutral
        ? (gamma - config.neutral) / (config.max - config.neutral)
        : (gamma - config.neutral) / (config.neutral - config.min);
      setGammaPointer({ x: 100 + displacement * 100, y: 100 });
    }
  }, [gammaEditorOpen]);

  useEffect(() => {
    if (levelsEditorOpen) {
      const current = imageAdjustmentsRef.current;
      setLevelsPointer({
        x: 100 + ((current.levelsBlack ?? 0) / 127) * 100,
        y: 100 + ((255 - (current.levelsWhite ?? 255)) / 127) * 100,
      });
    }
  }, [levelsEditorOpen]);

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

  useEffect(() => {
    if (!imageUrl) {
      setSourceImage(null);
      return;
    }

    let cancelled = false;
    const image = new Image();

    image.onload = () => {
      if (!cancelled) {
        setSourceImage(image);
      }
    };
    image.onerror = () => {
      if (!cancelled) {
        setSourceImage(null);
      }
    };
    image.src = imageUrl;

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  const sliceLineColor =
    gridColor === "black"
      ? "rgba(220, 38, 38, 0.95)"
      : "rgba(239, 68, 68, 0.95)";
  const tileConfig = getTileConfig(sliceSize, sliceOrientation);

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

  let imagePanScaleX = 0;
  let imagePanScaleY = 0;
  let imageViewRect: ReturnType<typeof buildImageViewRect> | null = null;

  if (sourcePixelWidth && sourcePixelHeight) {
    imageViewRect = buildImageViewRect({
      sourceImageWidth: sourcePixelWidth,
      sourceImageHeight: sourcePixelHeight,
      printedWidthIn,
      printedHeightIn,
      imageZoom,
      imageOffsetX,
      imageOffsetY,
    });

    const scaleX = frameWidthPx / imageViewRect.sourceWidth;
    const scaleY = frameHeightPx / imageViewRect.sourceHeight;
    const maxOffsetX = Math.max(0, (sourcePixelWidth - imageViewRect.sourceWidth) / 2);
    const maxOffsetY = Math.max(
      0,
      (sourcePixelHeight - imageViewRect.sourceHeight) / 2,
    );

    imagePanScaleX = maxOffsetX > 0 ? 100 / (scaleX * maxOffsetX) : 0;
    imagePanScaleY = maxOffsetY > 0 ? 100 / (scaleY * maxOffsetY) : 0;
  }

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    if (!sourceImage || !imageViewRect || frameWidthPx < 1 || frameHeightPx < 1) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    drawAdjustedSliceToCanvas({
      canvas,
      image: sourceImage,
      sourceX: imageViewRect.sourceX,
      sourceY: imageViewRect.sourceY,
      sourceWidth: imageViewRect.sourceWidth,
      sourceHeight: imageViewRect.sourceHeight,
      destWidth: frameWidthPx,
      destHeight: frameHeightPx,
      adjustments: imageAdjustments,
    });
  }, [sourceImage, imageViewRect, frameWidthPx, frameHeightPx, imageAdjustments]);

  function handlePreviewWheel(e: WheelEvent<HTMLDivElement>) {
    e.preventDefault();

    if (touchMode === "grid") {
      const gridStep = e.deltaY < 0 ? 0.1 : -0.1;
      setGridSizeIn(roundToTenth(clamp(gridSizeIn + gridStep, 0.5, 2)));
      return;
    }

    if (!imageUrl) return;

    const zoomConfig = IMAGE_ADJUSTMENT_CONFIG.zoom;
    const zoomStepSize = e.shiftKey ? zoomConfig.fastWheelStep : zoomConfig.wheelStep;
    const zoomStep = e.deltaY < 0 ? zoomStepSize : -zoomStepSize;
    setImageZoom(clamp(imageZoom + zoomStep, zoomConfig.min, zoomConfig.max));
  }

  function handleImagePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!imageUrl && !e.altKey) return;

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const interactionMode = e.altKey
      ? "grid"
      : touchMode;

    if (activePointersRef.current.size === 2) {
      const [first, second] = [...activePointersRef.current.values()];
      pinchStartRef.current = {
        mode: interactionMode,
        distance: Math.max(Math.hypot(second.x - first.x, second.y - first.y), 1),
        imageZoom,
        gridSizeIn,
      };
      dragStartRef.current = null;
      return;
    }

    dragStartRef.current = {
      mode: interactionMode,
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
    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    const pinchStart = pinchStartRef.current;
    if (pinchStart && activePointersRef.current.size >= 2) {
      const [first, second] = [...activePointersRef.current.values()];
      const distance = Math.max(Math.hypot(second.x - first.x, second.y - first.y), 1);
      const scale = distance / pinchStart.distance;
      if (pinchStart.mode === "grid") {
        setGridSizeIn(
          (Math.round(clamp(pinchStart.gridSizeIn * scale, 0.5, 2) * 100) /
            100) as GridSize,
        );
      } else if (imageUrl) {
        const zoomConfig = IMAGE_ADJUSTMENT_CONFIG.zoom;
        setImageZoom(clamp(
          Math.round((pinchStart.imageZoom * scale) / zoomConfig.step) * zoomConfig.step,
          zoomConfig.min,
          zoomConfig.max,
        ));
      }
      return;
    }

    const dragStart = dragStartRef.current;

    if (!dragStart || dragStart.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (dragStart.mode === "grid") {
      if (gridSizeIn <= 0) return;
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
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) pinchStartRef.current = null;
    if (dragStartRef.current?.pointerId === e.pointerId) {
      dragStartRef.current = null;
    }
  }

  function updateCurveFromPointer(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const input = clamp(Math.round(((e.clientX - rect.left) / rect.width) * 255), 1, 254);
    const output = clamp(Math.round((1 - (e.clientY - rect.top) / rect.height) * 255), 0, 255);
    onCurveChange?.(input, output);
  }

  function updateBrightnessContrastFromPointer(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const exposureConfig = IMAGE_ADJUSTMENT_CONFIG.exposure;
    const contrastConfig = IMAGE_ADJUSTMENT_CONFIG.contrast;
    const exposure = Math.round(clamp(
      exposureConfig.min + ((e.clientX - rect.left) / rect.width) * (exposureConfig.max - exposureConfig.min),
      exposureConfig.min,
      exposureConfig.max,
    ) / exposureConfig.step) * exposureConfig.step;
    const contrast = clamp(Math.round(
      contrastConfig.min + (1 - (e.clientY - rect.top) / rect.height) * (contrastConfig.max - contrastConfig.min),
    ), contrastConfig.min, contrastConfig.max);
    onBrightnessContrastChange?.(exposure, contrast);
  }

  function updateShadowsHighlightsFromPointer(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const shadows = clamp(Math.round((((e.clientX - rect.left) / rect.width) * 200) - 100), -100, 100);
    const highlights = clamp(Math.round((1 - (e.clientY - rect.top) / rect.height) * 200 - 100), -100, 100);
    onShadowsHighlightsChange?.(shadows, highlights);
  }

  function updatePerspectiveFromPointer(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const config = IMAGE_ADJUSTMENT_CONFIG.perspective;
    const value = config.max - ((e.clientY - rect.top) / rect.height) * (config.max - config.min);
    onPerspectiveChange?.(Math.round(clamp(value, config.min, config.max) / config.step) * config.step);
  }

  function updateSaturationVibranceFromPointer(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const saturation = clamp(Math.round(((e.clientX - rect.left) / rect.width) * 200), 0, 200);
    const vibrance = clamp(Math.round((1 - (e.clientY - rect.top) / rect.height) * 200 - 100), -100, 100);
    onSaturationVibranceChange?.(saturation, vibrance);
  }

  function updateLevelsFromPointer(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 200, 0, 200);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 200, 0, 200);
    setLevelsPointer({ x, y });
    const black = Math.round((Math.abs(x - 100) / 100) * 127);
    const white = Math.round(255 - (Math.abs(y - 100) / 100) * 127);
    onLevelsChange?.(black, white);
  }

  function updateGammaFromPointer(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 200, 0, 200);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 200, 0, 200);
    setGammaPointer({ x, y });
    const horizontal = (x - 100) / 100;
    const vertical = (100 - y) / 100;
    const displacement = Math.abs(horizontal) >= Math.abs(vertical) ? horizontal : vertical;
    const config = IMAGE_ADJUSTMENT_CONFIG.gamma;
    const gamma = displacement >= 0
      ? config.neutral + displacement * (config.max - config.neutral)
      : config.neutral + displacement * (config.neutral - config.min);
    onGammaChange?.(Math.round(gamma / config.step) * config.step);
  }

  function pointerAngle(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return Math.atan2(
      e.clientY - (rect.top + rect.height / 2),
      e.clientX - (rect.left + rect.width / 2),
    ) * 180 / Math.PI;
  }

  function updateGridRotationPointer(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setGridRotationPointer({
      x: clamp(((e.clientX - rect.left) / rect.width) * 200, 0, 200),
      y: clamp(((e.clientY - rect.top) / rect.height) * 200, 0, 200),
    });
  }

  function updateGridRotationFromPointer(e: PointerEvent<SVGSVGElement>) {
    const drag = gridRotationDragRef.current;
    if (!drag) return;
    updateGridRotationPointer(e);
    let delta = pointerAngle(e) - drag.startAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const rotation = clamp(drag.startRotation + delta * 2, -90, 90);
    onGridRotationChange?.(roundToTenth(snapPeriodic(rotation, VECTOR_CONTROL_CONFIG.gridRotation)));
  }

  function updateGridColorFromPointer(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 200, 0, 200);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 200, 0, 200);
    const hue = Math.round((x / 200) * 360) % 360;
    const lightness = Math.round((1 - y / 200) * 100);
    setGridColorPointer({ x, y });
    onGridColorChange?.(`hsl(${hue} 100% ${lightness}%)`, hue, lightness);
  }

  function updateGridThicknessFromPointer(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 200, 0, 200);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 200, 0, 200);
    const displacement = Math.max(Math.abs(x - 100), Math.abs(y - 100)) / 100;
    setGridThicknessPointer({ x, y });
    onGridThicknessChange?.(roundToTenth(1 + displacement * 9));
  }

  function updateGridScaleFromPointer(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const maxRadius = Math.min(rect.width, rect.height) / 2;
    const distance = Math.hypot(dx, dy);
    const magnitude = clamp(distance / maxRadius, 0, 1);
    const clipScale = distance > maxRadius ? maxRadius / distance : 1;
    const x = 100 + (dx * clipScale / rect.width) * 200;
    const y = 100 + (dy * clipScale / rect.height) * 200;
    setGridScalePointer({ x, y });

    onGridScaleChange?.(gridScaleFromMagnitude(magnitude));
    if (magnitude > 0.01) {
      const rotation = Math.atan2(dy, dx) * 180 / Math.PI;
      onGridRotationChange?.(roundToTenth(snapPeriodic(rotation, VECTOR_CONTROL_CONFIG.gridRotation)));
    }
  }

  function updateGridIsoFromPointer(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const maxRadius = Math.min(rect.width, rect.height) / 2;
    const distance = Math.hypot(dx, dy);
    const magnitude = clamp(distance / maxRadius, 0, 1);
    const clipScale = distance > maxRadius ? maxRadius / distance : 1;
    const x = 100 + (dx * clipScale / rect.width) * 200;
    const y = 100 + (dy * clipScale / rect.height) * 200;
    setGridIsoPointer({ x, y });

    const skewProgress = magnitude <= 0.1 ? 0 : (magnitude - 0.1) / 0.9;
    onGridIsoChange?.(roundToTenth(skewProgress * 65));
    if (magnitude > 0.1) {
      const rotation = Math.atan2(dy, dx) * 180 / Math.PI;
      onGridRotationChange?.(roundToTenth(snapPeriodic(rotation, VECTOR_CONTROL_CONFIG.gridRotation)));
    }

  }

  const curvePath = Array.from({ length: 65 }, (_, index) => {
    const input = (index / 64) * 255;
    const output = evaluateToneCurve(imageAdjustments.curveInput ?? 128, imageAdjustments.curveOutput ?? 128, input);
    return `${index === 0 ? "M" : "L"} ${input} ${255 - output}`;
  }).join(" ");

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "grid",
      }}
    >
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
          {!bare && <fieldset
            className="mobile-touch-mode"
            aria-label="Preview zoom and pan target"
          >
            <legend>Zoom/Pan:</legend>
            {(["image", "grid"] as const).map((mode) => (
              <label
                key={mode}
                data-selected={touchMode === mode ? "true" : "false"}
              >
                <input
                  type="radio"
                  name="preview-touch-mode"
                  value={mode}
                  checked={touchMode === mode}
                  onChange={() => setTouchMode(mode)}
                />
                {mode === "image" ? "Image" : "Grid"}
              </label>
            ))}
          </fieldset>}

          {!hideGestureGuidance && <div className="preview-gesture-guidance"
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
          </div>}

          {!hideGestureGuidance && <div className="preview-gesture-guidance"
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
          </div>}

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
                <canvas
                  ref={previewCanvasRef}
                  aria-label="Uploaded map preview"
                  role="img"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                  }}
                />

                {!curveEditorOpen && !brightnessContrastEditorOpen && !shadowsHighlightsEditorOpen && !perspectiveEditorOpen && !saturationVibranceEditorOpen && !levelsEditorOpen && !gammaEditorOpen && <SvgGridLayer
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
                />}

                {!curveEditorOpen && !brightnessContrastEditorOpen && !shadowsHighlightsEditorOpen && !perspectiveEditorOpen && !saturationVibranceEditorOpen && !levelsEditorOpen && !gammaEditorOpen && <div
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
                />}

                {curveEditorOpen && <svg
                  viewBox="0 0 255 255"
                  preserveAspectRatio="none"
                  aria-label="Tone curve editor"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    updateCurveFromPointer(event);
                  }}
                  onPointerMove={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) updateCurveFromPointer(event);
                  }}
                  onPointerUp={(event) => {
                    event.stopPropagation();
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
                    onCurveCommit?.();
                  }}
                  onPointerCancel={onCurveCommit}
                  style={{ position: "absolute", inset: 0, zIndex: 6, width: "100%", height: "100%", background: "transparent", touchAction: "none", cursor: "crosshair" }}
                >
                  <line x1="0" y1="255" x2="255" y2="0" stroke="white" strokeOpacity="0.7" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <path d={curvePath} fill="none" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>}
                {curveEditorOpen && <span aria-hidden="true" style={{
                  position: "absolute",
                  zIndex: 7,
                  left: `${((imageAdjustments.curveInput ?? 128) / 255) * 100}%`,
                  top: `${(1 - (imageAdjustments.curveOutput ?? 128) / 255) * 100}%`,
                  width: "4px",
                  height: "4px",
                  boxSizing: "border-box",
                  border: "1px solid black",
                  borderRadius: "50%",
                  background: "white",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                }} />}
                {brightnessContrastEditorOpen && <svg
                  viewBox="0 0 200 200"
                  preserveAspectRatio="none"
                  aria-label="Brightness and contrast editor"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    updateBrightnessContrastFromPointer(event);
                  }}
                  onPointerMove={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) updateBrightnessContrastFromPointer(event);
                  }}
                  onPointerUp={(event) => {
                    event.stopPropagation();
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
                    onBrightnessContrastCommit?.();
                  }}
                  onPointerCancel={onBrightnessContrastCommit}
                  style={{ position: "absolute", inset: 0, zIndex: 6, width: "100%", height: "100%", background: "transparent", touchAction: "none", cursor: "crosshair" }}
                >
                  <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="100" x2="200" y2="100" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line
                    x1="100"
                    y1="100"
                    x2={((imageAdjustments.exposure - IMAGE_ADJUSTMENT_CONFIG.exposure.min) / (IMAGE_ADJUSTMENT_CONFIG.exposure.max - IMAGE_ADJUSTMENT_CONFIG.exposure.min)) * 200}
                    y2={200 - ((imageAdjustments.contrast - IMAGE_ADJUSTMENT_CONFIG.contrast.min) / (IMAGE_ADJUSTMENT_CONFIG.contrast.max - IMAGE_ADJUSTMENT_CONFIG.contrast.min)) * 200}
                    stroke="white"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>}
                {brightnessContrastEditorOpen && <span aria-hidden="true" style={{
                  position: "absolute",
                  zIndex: 7,
                  left: `${((imageAdjustments.exposure - IMAGE_ADJUSTMENT_CONFIG.exposure.min) / (IMAGE_ADJUSTMENT_CONFIG.exposure.max - IMAGE_ADJUSTMENT_CONFIG.exposure.min)) * 100}%`,
                  top: `${(1 - (imageAdjustments.contrast - IMAGE_ADJUSTMENT_CONFIG.contrast.min) / (IMAGE_ADJUSTMENT_CONFIG.contrast.max - IMAGE_ADJUSTMENT_CONFIG.contrast.min)) * 100}%`,
                  width: "4px",
                  height: "4px",
                  boxSizing: "border-box",
                  border: "1px solid black",
                  borderRadius: "50%",
                  background: "white",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                }} />}
                {shadowsHighlightsEditorOpen && <svg
                  viewBox="0 0 200 200"
                  preserveAspectRatio="none"
                  aria-label="Shadows and highlights editor"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    updateShadowsHighlightsFromPointer(event);
                  }}
                  onPointerMove={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) updateShadowsHighlightsFromPointer(event);
                  }}
                  onPointerUp={(event) => {
                    event.stopPropagation();
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
                    onShadowsHighlightsCommit?.();
                  }}
                  onPointerCancel={onShadowsHighlightsCommit}
                  style={{ position: "absolute", inset: 0, zIndex: 6, width: "100%", height: "100%", background: "transparent", touchAction: "none", cursor: "crosshair" }}
                >
                  <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="100" x2="200" y2="100" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="100" y1="100" x2={(imageAdjustments.shadows ?? 0) + 100} y2={100 - (imageAdjustments.highlights ?? 0)} stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>}
                {shadowsHighlightsEditorOpen && <span aria-hidden="true" style={{
                  position: "absolute",
                  zIndex: 7,
                  left: `${((imageAdjustments.shadows ?? 0) + 100) / 2}%`,
                  top: `${(100 - (imageAdjustments.highlights ?? 0)) / 2}%`,
                  width: "4px",
                  height: "4px",
                  boxSizing: "border-box",
                  border: "1px solid black",
                  borderRadius: "50%",
                  background: "white",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                }} />}
                {perspectiveEditorOpen && <svg
                  viewBox="0 0 200 200"
                  preserveAspectRatio="none"
                  aria-label="Perspective editor"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    updatePerspectiveFromPointer(event);
                  }}
                  onPointerMove={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) updatePerspectiveFromPointer(event);
                  }}
                  onPointerUp={(event) => {
                    event.stopPropagation();
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
                    onPerspectiveCommit?.();
                  }}
                  onPointerCancel={onPerspectiveCommit}
                  style={{ position: "absolute", inset: 0, zIndex: 6, width: "100%", height: "100%", background: "transparent", touchAction: "none", cursor: "ns-resize" }}
                >
                  <line x1="0" y1="100" x2="200" y2="100" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="100" y1="100" x2="100" y2={100 - (imageAdjustments.perspective ?? 0) * 100} stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>}
                {perspectiveEditorOpen && <span aria-hidden="true" style={{
                  position: "absolute",
                  zIndex: 7,
                  left: "50%",
                  top: `${(1 - (imageAdjustments.perspective ?? 0)) * 50}%`,
                  width: "4px",
                  height: "4px",
                  boxSizing: "border-box",
                  border: "1px solid black",
                  borderRadius: "50%",
                  background: "white",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                }} />}
                {saturationVibranceEditorOpen && <svg viewBox="0 0 200 200" preserveAspectRatio="none" aria-label="Saturation and vibrance editor" onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); updateSaturationVibranceFromPointer(event); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updateSaturationVibranceFromPointer(event); }} onPointerUp={(event) => { event.stopPropagation(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); onSaturationVibranceCommit?.(); }} onPointerCancel={onSaturationVibranceCommit} style={{ position: "absolute", inset: 0, zIndex: 6, width: "100%", height: "100%", background: "transparent", touchAction: "none", cursor: "crosshair" }}>
                  <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="100" x2="200" y2="100" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="100" y1="100" x2={imageAdjustments.saturation} y2={100 - (imageAdjustments.vibrance ?? 0)} stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>}
                {saturationVibranceEditorOpen && <span aria-hidden="true" style={{ position: "absolute", zIndex: 7, left: `${imageAdjustments.saturation / 2}%`, top: `${(100 - (imageAdjustments.vibrance ?? 0)) / 2}%`, width: "4px", height: "4px", boxSizing: "border-box", border: "1px solid black", borderRadius: "50%", background: "white", transform: "translate(-50%, -50%)", pointerEvents: "none" }} />}

                {levelsEditorOpen && <svg viewBox="0 0 200 200" preserveAspectRatio="none" aria-label="Black and white levels editor" onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); updateLevelsFromPointer(event); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updateLevelsFromPointer(event); }} onPointerUp={(event) => { event.stopPropagation(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); onLevelsCommit?.(); }} onPointerCancel={onLevelsCommit} style={{ position: "absolute", inset: 0, zIndex: 6, width: "100%", height: "100%", background: "transparent", touchAction: "none", cursor: "crosshair" }}>
                  <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="100" x2="200" y2="100" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="100" y1="100" x2={levelsPointer.x} y2={levelsPointer.y} stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>}
                {levelsEditorOpen && <span aria-hidden="true" style={{ position: "absolute", zIndex: 7, left: `${levelsPointer.x / 2}%`, top: `${levelsPointer.y / 2}%`, width: "4px", height: "4px", boxSizing: "border-box", border: "1px solid black", borderRadius: "50%", background: "white", transform: "translate(-50%, -50%)", pointerEvents: "none" }} />}

                {gammaEditorOpen && <svg viewBox="0 0 200 200" preserveAspectRatio="none" aria-label="Gamma editor" onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); updateGammaFromPointer(event); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updateGammaFromPointer(event); }} onPointerUp={(event) => { event.stopPropagation(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); onGammaCommit?.(); }} onPointerCancel={onGammaCommit} style={{ position: "absolute", inset: 0, zIndex: 6, width: "100%", height: "100%", background: "transparent", touchAction: "none", cursor: "crosshair" }}>
                  <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="100" x2="200" y2="100" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="100" y1="100" x2={gammaPointer.x} y2={gammaPointer.y} stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>}
                {gammaEditorOpen && <span aria-hidden="true" style={{ position: "absolute", zIndex: 7, left: `${gammaPointer.x / 2}%`, top: `${gammaPointer.y / 2}%`, width: "4px", height: "4px", boxSizing: "border-box", border: "1px solid black", borderRadius: "50%", background: "white", transform: "translate(-50%, -50%)", pointerEvents: "none" }} />}

                {gridRotationEditorOpen && <svg viewBox="0 0 200 200" preserveAspectRatio="none" aria-label="Grid rotation angular vector control" onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  gridRotationDragRef.current = { startAngle: pointerAngle(event), startRotation: gridRotation };
                  updateGridRotationPointer(event);
                }} onPointerMove={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) updateGridRotationFromPointer(event);
                }} onPointerUp={(event) => {
                  event.stopPropagation();
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
                  gridRotationDragRef.current = null;
                  onGridRotationCommit?.();
                }} onPointerCancel={() => { gridRotationDragRef.current = null; onGridRotationCommit?.(); }} style={{ position: "absolute", inset: 0, zIndex: 6, width: "100%", height: "100%", background: "transparent", touchAction: "none", cursor: "crosshair" }}>
                  {gridRotationPointer && <line x1="100" y1="100" x2={gridRotationPointer.x} y2={gridRotationPointer.y} stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />}
                </svg>}
                {gridRotationEditorOpen && gridRotationPointer && <span aria-hidden="true" style={{ position: "absolute", zIndex: 7, left: `${gridRotationPointer.x / 2}%`, top: `${gridRotationPointer.y / 2}%`, width: "4px", height: "4px", boxSizing: "border-box", border: "1px solid black", borderRadius: "50%", background: "white", transform: "translate(-50%, -50%)", pointerEvents: "none" }} />}

                {gridColorEditorOpen && <svg viewBox="0 0 200 200" preserveAspectRatio="none" aria-label="Grid color vector control" onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); updateGridColorFromPointer(event); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updateGridColorFromPointer(event); }} onPointerUp={(event) => { event.stopPropagation(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); onGridColorCommit?.(); }} onPointerCancel={onGridColorCommit} style={{ position: "absolute", inset: 0, zIndex: 8, width: "100%", height: "100%", background: "transparent", touchAction: "none", cursor: "crosshair" }}>
                  <defs>
                    <linearGradient id="light-grid-colors" x1="0" x2="1"><stop offset="0" stopColor="hsl(0 100% 78%)" /><stop offset="16.7%" stopColor="hsl(60 100% 78%)" /><stop offset="33.3%" stopColor="hsl(120 100% 78%)" /><stop offset="50%" stopColor="hsl(180 100% 78%)" /><stop offset="66.7%" stopColor="hsl(240 100% 78%)" /><stop offset="83.3%" stopColor="hsl(300 100% 78%)" /><stop offset="100%" stopColor="hsl(360 100% 78%)" /></linearGradient>
                    <linearGradient id="dark-grid-colors" x1="0" x2="1"><stop offset="0" stopColor="hsl(0 100% 18%)" /><stop offset="16.7%" stopColor="hsl(60 100% 18%)" /><stop offset="33.3%" stopColor="hsl(120 100% 18%)" /><stop offset="50%" stopColor="hsl(180 100% 18%)" /><stop offset="66.7%" stopColor="hsl(240 100% 18%)" /><stop offset="83.3%" stopColor="hsl(300 100% 18%)" /><stop offset="100%" stopColor="hsl(360 100% 18%)" /></linearGradient>
                  </defs>
                  <rect x="0" y="0" width="200" height="10" fill="url(#light-grid-colors)" />
                  <rect x="0" y="190" width="200" height="10" fill="url(#dark-grid-colors)" />
                  {gridColorPointer && <line x1="100" y1="100" x2={gridColorPointer.x} y2={gridColorPointer.y} stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />}
                </svg>}
                {gridColorEditorOpen && gridColorPointer && <span aria-hidden="true" style={{ position: "absolute", zIndex: 9, left: `${gridColorPointer.x / 2}%`, top: `${gridColorPointer.y / 2}%`, width: "4px", height: "4px", boxSizing: "border-box", border: "1px solid black", borderRadius: "50%", background: "white", transform: "translate(-50%, -50%)", pointerEvents: "none" }} />}

                {gridThicknessEditorOpen && <svg viewBox="0 0 200 200" preserveAspectRatio="none" aria-label="Grid line thickness vector control" onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); updateGridThicknessFromPointer(event); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updateGridThicknessFromPointer(event); }} onPointerUp={(event) => { event.stopPropagation(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); onGridThicknessCommit?.(); }} onPointerCancel={onGridThicknessCommit} style={{ position: "absolute", inset: 0, zIndex: 8, width: "100%", height: "100%", background: "transparent", touchAction: "none", cursor: "crosshair" }}>
                  <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="100" x2="200" y2="100" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="100" y1="100" x2={gridThicknessPointer.x} y2={gridThicknessPointer.y} stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>}
                {gridThicknessEditorOpen && <span aria-hidden="true" style={{ position: "absolute", zIndex: 9, left: `${gridThicknessPointer.x / 2}%`, top: `${gridThicknessPointer.y / 2}%`, width: "4px", height: "4px", boxSizing: "border-box", border: "1px solid black", borderRadius: "50%", background: "white", transform: "translate(-50%, -50%)", pointerEvents: "none" }} />}

                {gridScaleEditorOpen && <svg viewBox="0 0 200 200" preserveAspectRatio="none" aria-label="Grid scale vector control" onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); updateGridScaleFromPointer(event); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updateGridScaleFromPointer(event); }} onPointerUp={(event) => { event.stopPropagation(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); onGridScaleCommit?.(); }} onPointerCancel={onGridScaleCommit} style={{ position: "absolute", inset: 0, zIndex: 8, width: "100%", height: "100%", background: "transparent", touchAction: "none", cursor: "crosshair" }}>
                  <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="100" x2="200" y2="100" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="100" y1="100" x2={gridScalePointer.x} y2={gridScalePointer.y} stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>}
                {gridScaleEditorOpen && <span aria-hidden="true" style={{ position: "absolute", zIndex: 9, left: `${gridScalePointer.x / 2}%`, top: `${gridScalePointer.y / 2}%`, width: "4px", height: "4px", boxSizing: "border-box", border: "1px solid black", borderRadius: "50%", background: "white", transform: "translate(-50%, -50%)", pointerEvents: "none" }} />}

                {gridIsoEditorOpen && <svg viewBox="0 0 200 200" preserveAspectRatio="none" aria-label="Iso grid angle vector control" onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); updateGridIsoFromPointer(event); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updateGridIsoFromPointer(event); }} onPointerUp={(event) => { event.stopPropagation(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); onGridIsoCommit?.(); }} onPointerCancel={onGridIsoCommit} style={{ position: "absolute", inset: 0, zIndex: 8, width: "100%", height: "100%", background: "transparent", touchAction: "none", cursor: "crosshair" }}>
                  <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="100" x2="200" y2="100" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="100" y1="100" x2={gridIsoPointer.x} y2={gridIsoPointer.y} stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>}
                {gridIsoEditorOpen && <span aria-hidden="true" style={{ position: "absolute", zIndex: 9, left: `${gridIsoPointer.x / 2}%`, top: `${gridIsoPointer.y / 2}%`, width: "4px", height: "4px", boxSizing: "border-box", border: "1px solid black", borderRadius: "50%", background: "white", transform: "translate(-50%, -50%)", pointerEvents: "none" }} />}
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
    </div>
  );
}

export default PreviewPanel;
