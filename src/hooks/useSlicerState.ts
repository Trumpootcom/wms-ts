// src/hooks/useSlicerState.ts
import { useEffect, useMemo, useState } from "react";
import {
  buildSliceEstimate,
  clamp,
  roundToTenth,
} from "../slicer/math.ts";
import { exportSlicedPdf } from "../slicer/pdf.ts";
import {
  buildSavedPageSetup,
  createProjectFile,
  getProjectDownloadFileName,
  openProjectFile,
} from "../slicer/projectFile.ts";
import {
  deleteLocalProject,
  getLocalProject,
  listLocalProjects,
  renameLocalProject,
  requestPersistentProjectStorage,
  saveLocalProject,
  type LocalProjectSummary,
} from "../slicer/projectStore.ts";
import {
  DEFAULT_HEIGHT_IN,
  DEFAULT_WIDTH_IN,
  EXPORT_DPI,
  MAX_SIZE_IN,
  MIN_SIZE_IN,
} from "../slicer/defaults.ts";
import type {
  GridColor,
  GridMode,
  GridSize,
  ImageAdjustments,
  SliceOrientation,
  SliceSize,
} from "../slicer/types.ts";

export function useSlicerState() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("map-image");
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
  const [gridPerspectiveAngle, setGridPerspectiveAngle] = useState<number>(0);

  const [gridColor, setGridColor] = useState<GridColor>("black");
  const [sliceSize, setSliceSize] = useState<SliceSize>("8x10");
  const [sliceOrientation, setSliceOrientation] =
    useState<SliceOrientation>("portrait");
  const [gridSizeIn, setGridSizeIn] = useState<GridSize>(1);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>("");
  const [localProjects, setLocalProjects] = useState<LocalProjectSummary[]>([]);
  const [activeLocalProjectId, setActiveLocalProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("WMS Saved Map");
  const [isRecentProjectsOpen, setIsRecentProjectsOpen] = useState(false);

  async function refreshLocalProjects() {
    setLocalProjects(await listLocalProjects());
  }

  useEffect(() => {
    void refreshLocalProjects().catch(console.error);
    void requestPersistentProjectStorage();
  }, []);

  const [imageAdjustments, setImageAdjustments] = useState<ImageAdjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    gamma: 1,
  });

  const [imageZoom, setImageZoom] = useState(100);
  const [imageOffsetX, setImageOffsetX] = useState(0);
  const [imageOffsetY, setImageOffsetY] = useState(0);
  const [gridLineThickness, setGridLineThickness] = useState<number>(1);

  const [gridPhaseX, setGridPhaseX] = useState<number>(0);
  const [gridPhaseY, setGridPhaseY] = useState<number>(0);

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
      setImageBlob(file);
      setImageFileName(file.name || "map-image");
      setProjectName(file.name.replace(/\.[^.]+$/, "") || "WMS Saved Map");
      setActiveLocalProjectId(null);

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

  async function loadSavedImage(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not load the project image."));
      img.src = url;
    });

    if (!img.width || !img.height) {
      throw new Error("The project image is not valid.");
    }

    setImageUrl(url);
    setImageBlob(blob);
    setImageFileName(fileName);
    setSourcePixelWidth(img.width);
    setSourcePixelHeight(img.height);
    setImageAspectRatio(img.width / img.height);
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
    () =>
      buildSliceEstimate(
        printedWidthIn,
        printedHeightIn,
        sliceSize,
        sliceOrientation,
      ),
    [printedWidthIn, printedHeightIn, sliceSize, sliceOrientation],
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
        sliceOrientation,
        sliceEstimate,
        gridMode,
        gridColor,
        gridSizeIn,
        gridPhaseX,
        gridPhaseY,
        gridLineThickness,
        gridPerspectiveAngle,
        gridRotation,
        imageAdjustments,
        imageZoom,
        imageOffsetX,
        imageOffsetY,
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

  async function buildCurrentProjectBlob(name = projectName) {
    if (!imageBlob || !sourcePixelWidth || !sourcePixelHeight) {
      throw new Error("Please upload an image before saving a project.");
    }

    return createProjectFile({
        projectName: name,
        mapName: name,
        imageBlob,
        imageFileName,
        sourcePixelWidth,
        sourcePixelHeight,
        settings: {
          printedWidthIn,
          printedHeightIn,
          maintainAspectRatio,
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
          pageSetup: buildSavedPageSetup(sliceSize, sliceOrientation),
          imageAdjustments,
          imageZoom,
          imageOffsetX,
          imageOffsetY,
          exportDpi: EXPORT_DPI,
        },
      });
  }

  function downloadProject(blob: Blob, name: string) {
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = getProjectDownloadFileName(name);
    link.click();
    URL.revokeObjectURL(downloadUrl);
  }

  async function handleExportProject() {
    setExportMessage("Exporting project...");
    try {
      const projectBlob = await buildCurrentProjectBlob();
      downloadProject(projectBlob, projectName);
      setExportMessage("Project exported.");
    } catch (error) {
      console.error(error);
      setExportMessage(error instanceof Error ? error.message : "Project export failed.");
    }
  }

  async function handleSaveProject() {
    setExportMessage("Saving project locally...");
    try {
      const projectBlob = await buildCurrentProjectBlob();
      const saved = await saveLocalProject(projectBlob, projectName, activeLocalProjectId);
      setActiveLocalProjectId(saved.id);
      await refreshLocalProjects();
      setExportMessage("Project saved locally.");
    } catch (error) {
      console.error(error);
      setExportMessage(error instanceof Error ? error.message : "Local save failed.");
    }
  }

  async function applyOpenedProject(blob: Blob, localId?: string, localName?: string) {
      const project = await openProjectFile(blob);
      const settings = project.settings;
      await loadSavedImage(project.imageBlob, project.imageFileName);
      setProjectName(localName ?? project.projectName);
      setActiveLocalProjectId(localId ?? null);

      setPrintedWidthIn(settings.printedWidthIn);
      setPrintedHeightIn(settings.printedHeightIn);
      setMaintainAspectRatio(settings.maintainAspectRatio);
      setGridMode(settings.gridMode);
      setGridPerspectiveAngle(settings.gridPerspectiveAngle);
      setGridRotation(settings.gridRotation);
      setGridColor(settings.gridColor);
      setGridSizeIn(settings.gridSizeIn);
      setGridPhaseX(settings.gridPhaseX);
      setGridPhaseY(settings.gridPhaseY);
      setGridLineThickness(settings.gridLineThickness);
      setSliceSize(settings.sliceSize);
      setSliceOrientation(settings.sliceOrientation);
      setImageAdjustments(settings.imageAdjustments);
      setImageZoom(settings.imageZoom);
      setImageOffsetX(settings.imageOffsetX);
      setImageOffsetY(settings.imageOffsetY);
  }

  async function handleOpenProject(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setExportMessage("Opening project...");

    try {
      await applyOpenedProject(file);
      const imported = await saveLocalProject(file, file.name.replace(/\.wmsts$/i, ""));
      setActiveLocalProjectId(imported.id);
      setProjectName(imported.name);
      await refreshLocalProjects();
      setExportMessage("Project imported and added to Recent Projects.");
    } catch (error) {
      console.error(error);
      setExportMessage("Project open failed.");
    }
  }

  async function handleOpenLocalProject(id: string) {
    setExportMessage("Opening local project...");
    try {
      const stored = await getLocalProject(id);
      if (!stored) throw new Error("The local project no longer exists.");
      await applyOpenedProject(stored.blob, stored.id, stored.name);
      setIsRecentProjectsOpen(false);
      setExportMessage("Local project opened.");
    } catch (error) {
      console.error(error);
      setExportMessage("Local project open failed.");
    }
  }

  async function handleRenameLocalProject(id: string, name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    await renameLocalProject(id, trimmedName);
    if (id === activeLocalProjectId) setProjectName(trimmedName);
    await refreshLocalProjects();
  }

  async function handleDeleteLocalProject(id: string) {
    await deleteLocalProject(id);
    if (id === activeLocalProjectId) setActiveLocalProjectId(null);
    await refreshLocalProjects();
  }

  async function handleExportLocalProject(id: string) {
    const stored = await getLocalProject(id);
    if (!stored) return;
    downloadProject(stored.blob, stored.name);
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
    imageBlob,
    imageFileName,
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
    gridSizeIn,
    gridPhaseX,
    gridPhaseY,
    gridLineThickness,
    sliceSize,
    sliceOrientation,

    imageZoom,
    imageOffsetX,
    imageOffsetY,

    sliceEstimate,
    sourceSizeReport,

    isExporting,
    exportMessage,
    projectName,
    localProjects,
    isRecentProjectsOpen,

    imageAdjustments,

    setGridMode,
    setGridPerspectiveAngle,
    setGridRotation,
    setGridColor,
    setGridSizeIn,
    setGridPhaseX,
    setGridPhaseY,
    setGridLineThickness,
    setSliceSize,
    setSliceOrientation,

    setImageZoom,
    setImageOffsetX,
    setImageOffsetY,

    handleFileUpload,
    handleSaveProject,
    handleExportProject,
    handleOpenProject,
    handleOpenLocalProject,
    handleRenameLocalProject,
    handleDeleteLocalProject,
    handleExportLocalProject,
    setIsRecentProjectsOpen,
    updateWidth,
    updateHeight,
    handleAspectRatioToggle,
    handleExportPdf,

    updateImageAdjustment,
    resetImageAdjustments,

    exportDpi: EXPORT_DPI,
  };
}
