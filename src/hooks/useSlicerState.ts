// src/hooks/useSlicerState.ts
import { useMemo, useState } from "react";
import {
  buildSliceEstimate,
  clamp,
  getPreviewStageSize,
  roundToTenth,
} from "../slicer/math.ts";
import { exportSlicedPdf } from "../slicer/pdf.ts";
import {
  DEFAULT_HEIGHT_IN,
  DEFAULT_WIDTH_IN,
  EXPORT_DPI,
  MAX_SIZE_IN,
  MIN_SIZE_IN,
  PREVIEW_MAX_HEIGHT_PX,
  PREVIEW_MAX_WIDTH_PX,
} from "../slicer/defaults.ts";
import type {
  GridColor,
  GridMode,
  GridSize,
  ImageAdjustments,
  SliceSize,
} from "../slicer/types.ts";

export function useSlicerState() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [sourcePixelWidth, setSourcePixelWidth] = useState<number | null>(null);
  const [sourcePixelHeight, setSourcePixelHeight] = useState<number | null>(null);

  const [printedWidthIn, setPrintedWidthIn] = useState<number>(DEFAULT_WIDTH_IN);
  const [printedHeightIn, setPrintedHeightIn] =
    useState<number>(DEFAULT_HEIGHT_IN);
  const [maintainAspectRatio, setMaintainAspectRatio] =
    useState<boolean>(false);

  const [gridMode, setGridMode] = useState<GridMode>("line");
  const [gridRotation, setGridRotation] = useState<number>(0);
  const [gridPerspectiveAngle, setGridPerspectiveAngle] = useState<number>(90);

  const [gridColor, setGridColor] = useState<GridColor>("black");
  const [sliceSize, setSliceSize] = useState<SliceSize>("8x10");
  const [gridSizeIn, setGridSizeIn] = useState<GridSize>(1);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>("");

  const [imageAdjustments, setImageAdjustments] = useState<ImageAdjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    gamma: 1,
  });

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    const img = new Image();
    img.onload = () => {
      if (!img.width || !img.height) return;

      setSourcePixelWidth(img.width);
      setSourcePixelHeight(img.height);

      const aspect = img.width / img.height;
      setImageAspectRatio(aspect);
      setImageUrl(url);

      if (maintainAspectRatio) {
        const adjustedHeight = clamp(
          roundToTenth(printedWidthIn / aspect),
          MIN_SIZE_IN,
          MAX_SIZE_IN,
        );
        const adjustedWidth = clamp(
          roundToTenth(adjustedHeight * aspect),
          MIN_SIZE_IN,
          MAX_SIZE_IN,
        );

        setPrintedHeightIn(adjustedHeight);
        setPrintedWidthIn(adjustedWidth);
      }
    };
    img.src = url;
  }

  function updateWidth(nextWidthRaw: number) {
    const nextWidth = clamp(roundToTenth(nextWidthRaw), MIN_SIZE_IN, MAX_SIZE_IN);

    if (maintainAspectRatio && imageAspectRatio) {
      let nextHeight = roundToTenth(nextWidth / imageAspectRatio);
      nextHeight = clamp(nextHeight, MIN_SIZE_IN, MAX_SIZE_IN);

      const adjustedWidth = clamp(
        roundToTenth(nextHeight * imageAspectRatio),
        MIN_SIZE_IN,
        MAX_SIZE_IN,
      );

      setPrintedWidthIn(adjustedWidth);
      setPrintedHeightIn(nextHeight);
      return;
    }

    setPrintedWidthIn(nextWidth);
  }

  function updateHeight(nextHeightRaw: number) {
    const nextHeight = clamp(
      roundToTenth(nextHeightRaw),
      MIN_SIZE_IN,
      MAX_SIZE_IN,
    );

    if (maintainAspectRatio && imageAspectRatio) {
      let nextWidth = roundToTenth(nextHeight * imageAspectRatio);
      nextWidth = clamp(nextWidth, MIN_SIZE_IN, MAX_SIZE_IN);

      const adjustedHeight = clamp(
        roundToTenth(nextWidth / imageAspectRatio),
        MIN_SIZE_IN,
        MAX_SIZE_IN,
      );

      setPrintedWidthIn(nextWidth);
      setPrintedHeightIn(adjustedHeight);
      return;
    }

    setPrintedHeightIn(nextHeight);
  }

  function handleAspectRatioToggle(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    setMaintainAspectRatio(checked);

    if (checked && imageAspectRatio) {
      let nextHeight = roundToTenth(printedWidthIn / imageAspectRatio);
      nextHeight = clamp(nextHeight, MIN_SIZE_IN, MAX_SIZE_IN);

      const adjustedWidth = clamp(
        roundToTenth(nextHeight * imageAspectRatio),
        MIN_SIZE_IN,
        MAX_SIZE_IN,
      );

      setPrintedHeightIn(nextHeight);
      setPrintedWidthIn(adjustedWidth);
    }
  }

  const sliceEstimate = useMemo(
    () => buildSliceEstimate(printedWidthIn, printedHeightIn, sliceSize),
    [printedWidthIn, printedHeightIn, sliceSize],
  );

  const previewStage = useMemo(
    () =>
      getPreviewStageSize(
        printedWidthIn,
        printedHeightIn,
        PREVIEW_MAX_WIDTH_PX,
        PREVIEW_MAX_HEIGHT_PX,
      ),
    [printedWidthIn, printedHeightIn],
  );

  const sourceSizeReport = useMemo(() => {
    if (!imageAspectRatio) return null;

    const printedAspect = printedWidthIn / printedHeightIn;

    let sourceWidthIn: number;
    let sourceHeightIn: number;

    if (imageAspectRatio >= printedAspect) {
      sourceHeightIn = printedHeightIn;
      sourceWidthIn = printedHeightIn * imageAspectRatio;
    } else {
      sourceWidthIn = printedWidthIn;
      sourceHeightIn = printedWidthIn / imageAspectRatio;
    }

    const stretchX = (printedWidthIn / sourceWidthIn) * 100;
    const stretchY = (printedHeightIn / sourceHeightIn) * 100;

    return {
      sourceWidthIn,
      sourceHeightIn,
      stretchX,
      stretchY,
    };
  }, [imageAspectRatio, printedWidthIn, printedHeightIn]);

  async function handleExportPdf() {
    if (!imageUrl) {
      setExportMessage("Please upload an image first.");
      return;
    }

    setIsExporting(true);
    setExportMessage("Preparing PDF...");

    try {
      await exportSlicedPdf({
        imageUrl,
        printedWidthIn,
        printedHeightIn,
        sliceSize,
        sliceEstimate,
        gridMode,
        gridColor,
        gridSizeIn,
        gridPerspectiveAngle,
        gridRotation,
        imageAdjustments,
        exportDpi: EXPORT_DPI,
        onProgress: setExportMessage,
      });

      setExportMessage("PDF downloaded.");
    } catch (error) {
      console.error(error);
      setExportMessage("Export failed.");
    } finally {
      setIsExporting(false);
    }
  }

  function updateImageAdjustment<K extends keyof ImageAdjustments>(
    key: K,
    value: ImageAdjustments[K],
  ) {
    setImageAdjustments((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function resetImageAdjustments() {
    setImageAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      gamma: 1,
    });
  }
  return {
    imageUrl,
    imageAspectRatio,
    sourcePixelWidth,
    sourcePixelHeight,

    printedWidthIn,
    printedHeightIn,
    maintainAspectRatio,

    gridMode,
    gridPerspectiveAngle,
    gridRotation,
    gridColor,
    sliceSize,
    gridSizeIn,

    isExporting,
    exportMessage,

    sliceEstimate,
    previewStage,
    sourceSizeReport,

    handleFileUpload,
    updateWidth,
    updateHeight,
    handleAspectRatioToggle,
    handleExportPdf,

    setGridMode,
    setGridPerspectiveAngle,
    setGridRotation,
    setGridColor,
    setSliceSize,
    setGridSizeIn,

    exportDpi: EXPORT_DPI,
    imageAdjustments,
    updateImageAdjustment,
    resetImageAdjustments,
  };
}