import { useRef, useState } from "react";
import type { useSlicerState } from "../hooks/useSlicerState.ts";
import imageIcon from "../assets/image.svg";
import gridIcon from "../assets/grid.svg";
import brightnessContrastIcon from "../assets/brightness-contrast.svg";
import toneIcon from "../assets/palette.svg";
import transformIcon from "../assets/transform.svg";
import shadowsHighlightsIcon from "../assets/s-h.svg";
import saturationVibranceIcon from "../assets/sv.svg";
import blackWhiteLevelsIcon from "../assets/b-w-l.svg";
import resetIcon from "../assets/reset.svg";
import rotate90Icon from "../assets/rot90.svg";
import projectIcon from "../assets/project_icon.svg";
import imageUploadIcon from "../assets/image_upload.svg";
import gammaIcon from "../assets/gamma.svg";
import curveIcon from "../assets/curve.svg";
import gridRotationIcon from "../assets/g-rot.svg";
import lineStyleIcon from "../assets/line-style.svg";
import gridScaleIcon from "../assets/g-scale.svg";
import { theme } from "../theme.ts";
import PreviewPanel from "./PreviewPanel.tsx";
import VectorSliderTray, { type VectorSlider } from "./VectorSliderTray.tsx";
import { IMAGE_ADJUSTMENT_CONFIG } from "../slicer/imageAdjustmentConfig.ts";

type Mode = "image" | "grid" | "project";
type ImageMenu = "root" | "tone" | "transform";
type Props = { slicer: ReturnType<typeof useSlicerState> };

const buttonStyle = {
  width: "48px",
  height: "48px",
  display: "grid",
  placeItems: "center",
  padding: 0,
  borderRadius: "12px",
  color: theme.control.buttonText,
  fontSize: "25px",
  fontWeight: 800,
  cursor: "pointer",
  backdropFilter: "blur(7px)",
  boxShadow: "0 2px 8px hsl(42 20% 5% / 28%)",
} as const;

export default function FloatingPreviewLayout({ slicer }: Props) {
  const [mode, setMode] = useState<Mode>("image");
  const [contextOpen, setContextOpen] = useState(false);
  const [imageMenu, setImageMenu] = useState<ImageMenu>("root");
  const [curveEditorOpen, setCurveEditorOpen] = useState(false);
  const [brightnessContrastEditorOpen, setBrightnessContrastEditorOpen] = useState(false);
  const [shadowsHighlightsEditorOpen, setShadowsHighlightsEditorOpen] = useState(false);
  const [perspectiveEditorOpen, setPerspectiveEditorOpen] = useState(false);
  const [saturationVibranceEditorOpen, setSaturationVibranceEditorOpen] = useState(false);
  const [levelsEditorOpen, setLevelsEditorOpen] = useState(false);
  const [gammaEditorOpen, setGammaEditorOpen] = useState(false);
  const [zoomPanSelected, setZoomPanSelected] = useState(false);
  const [gridRotationEditorOpen, setGridRotationEditorOpen] = useState(false);
  const [gridColorEditorOpen, setGridColorEditorOpen] = useState(false);
  const [gridThicknessEditorOpen, setGridThicknessEditorOpen] = useState(false);
  const [gridScaleEditorOpen, setGridScaleEditorOpen] = useState(false);
  const [gridIsoEditorOpen, setGridIsoEditorOpen] = useState(false);
  const [gridColorPosition, setGridColorPosition] = useState({ hue: 0, lightness: 0 });
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const activeImageControl = curveEditorOpen ? "curves"
    : brightnessContrastEditorOpen ? "exposure"
      : shadowsHighlightsEditorOpen ? "shadows"
        : levelsEditorOpen ? "levels"
          : gammaEditorOpen ? "gamma"
            : saturationVibranceEditorOpen ? "saturation"
              : perspectiveEditorOpen ? "perspective"
                : zoomPanSelected ? "zoom-pan"
                  : null;
  const activeToolTitle = gridIsoEditorOpen ? "Iso Grid"
    : gridScaleEditorOpen ? "Grid Scale"
    : gridThicknessEditorOpen ? "Grid Thickness"
      : gridColorEditorOpen ? "Grid Color"
        : gridRotationEditorOpen ? "Grid Rotation"
          : curveEditorOpen ? "Curves"
            : brightnessContrastEditorOpen ? "Image Tone"
              : shadowsHighlightsEditorOpen ? "Light Balance"
                : perspectiveEditorOpen ? "Perspective"
                  : saturationVibranceEditorOpen ? "Color Balance"
                    : levelsEditorOpen ? "Levels"
                      : gammaEditorOpen ? "Gamma"
                        : zoomPanSelected ? "Zoom & Pan"
                          : "";

  const vectorSliders: VectorSlider[] = [];
  const addSlider = (
    id: string,
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    defaultValue: number,
    onChange: (value: number) => void,
  ) => vectorSliders.push({ id, label, value, min, max, step, defaultValue, onChange });

  if (zoomPanSelected) {
    const zoom = IMAGE_ADJUSTMENT_CONFIG.zoom;
    addSlider("zoom", "Zoom", slicer.imageZoom, zoom.min, zoom.max, zoom.step, zoom.neutral, slicer.setImageZoom);
    addSlider("pan-x", "Pan X", slicer.imageOffsetX, -100, 100, 0.1, 0, slicer.setImageOffsetX);
    addSlider("pan-y", "Pan Y", slicer.imageOffsetY, -100, 100, 0.1, 0, slicer.setImageOffsetY);
  } else if (saturationVibranceEditorOpen) {
    const saturation = IMAGE_ADJUSTMENT_CONFIG.saturation;
    const vibrance = IMAGE_ADJUSTMENT_CONFIG.vibrance;
    addSlider("saturation", "Saturation", slicer.imageAdjustments.saturation, saturation.min, saturation.max, 1, saturation.neutral, (value) => slicer.setSaturationVibrance(value, slicer.imageAdjustments.vibrance));
    addSlider("vibrance", "Vibrance", slicer.imageAdjustments.vibrance, vibrance.min, vibrance.max, 1, vibrance.neutral, (value) => slicer.setSaturationVibrance(slicer.imageAdjustments.saturation, value));
  } else if (brightnessContrastEditorOpen) {
    const exposure = IMAGE_ADJUSTMENT_CONFIG.exposure;
    const contrast = IMAGE_ADJUSTMENT_CONFIG.contrast;
    addSlider("exposure", "Exposure", slicer.imageAdjustments.exposure, exposure.min, exposure.max, exposure.step, exposure.neutral, (value) => slicer.setExposureContrast(value, slicer.imageAdjustments.contrast));
    addSlider("contrast", "Contrast", slicer.imageAdjustments.contrast, contrast.min, contrast.max, 1, contrast.neutral, (value) => slicer.setExposureContrast(slicer.imageAdjustments.exposure, value));
  } else if (shadowsHighlightsEditorOpen) {
    const shadows = IMAGE_ADJUSTMENT_CONFIG.shadows;
    const highlights = IMAGE_ADJUSTMENT_CONFIG.highlights;
    addSlider("shadows", "Shadows", slicer.imageAdjustments.shadows, shadows.min, shadows.max, 1, shadows.neutral, (value) => slicer.setShadowsHighlights(value, slicer.imageAdjustments.highlights));
    addSlider("highlights", "Highlights", slicer.imageAdjustments.highlights, highlights.min, highlights.max, 1, highlights.neutral, (value) => slicer.setShadowsHighlights(slicer.imageAdjustments.shadows, value));
  } else if (curveEditorOpen) {
    const curve = IMAGE_ADJUSTMENT_CONFIG.curve;
    addSlider("curve-input", "Input", slicer.imageAdjustments.curveInput, curve.min, curve.max, 1, curve.neutralInput, (value) => slicer.setImageCurve(value, slicer.imageAdjustments.curveOutput));
    addSlider("curve-output", "Output", slicer.imageAdjustments.curveOutput, curve.min, curve.max, 1, curve.neutralOutput, (value) => slicer.setImageCurve(slicer.imageAdjustments.curveInput, value));
  } else if (levelsEditorOpen) {
    const levels = IMAGE_ADJUSTMENT_CONFIG.levels;
    addSlider("black-level", "Black", slicer.imageAdjustments.levelsBlack, levels.blackMin, levels.blackMax, 1, levels.neutralBlack, (value) => slicer.setImageLevels(value, slicer.imageAdjustments.levelsWhite));
    addSlider("white-level", "White", slicer.imageAdjustments.levelsWhite, levels.whiteMin, levels.whiteMax, 1, levels.neutralWhite, (value) => slicer.setImageLevels(slicer.imageAdjustments.levelsBlack, value));
  } else if (perspectiveEditorOpen) {
    const perspective = IMAGE_ADJUSTMENT_CONFIG.perspective;
    addSlider("perspective", "Perspective", slicer.imageAdjustments.perspective, perspective.min, perspective.max, perspective.step, perspective.neutral, slicer.setImagePerspective);
  } else if (gammaEditorOpen) {
    const gamma = IMAGE_ADJUSTMENT_CONFIG.gamma;
    addSlider("gamma", "Gamma", slicer.imageAdjustments.gamma, gamma.min, gamma.max, gamma.step, gamma.neutral, slicer.setImageGamma);
  } else if (gridRotationEditorOpen) {
    addSlider("grid-rotation", "Rotation", slicer.gridRotation, -90, 90, 0.5, 0, slicer.setGridRotation);
  } else if (gridColorEditorOpen) {
    const setGridColorAxis = (hue: number, lightness: number) => {
      const roundedHue = Math.round(hue) % 360;
      const roundedLightness = Math.round(lightness);
      slicer.setGridColor(`hsl(${roundedHue} 100% ${roundedLightness}%)`);
      setGridColorPosition({ hue: roundedHue, lightness: roundedLightness });
    };
    addSlider("grid-hue", "Hue", gridColorPosition.hue, 0, 359, 1, 0, (value) => setGridColorAxis(value, gridColorPosition.lightness));
    addSlider("grid-lightness", "Lightness", gridColorPosition.lightness, 0, 100, 1, 0, (value) => setGridColorAxis(gridColorPosition.hue, value));
  } else if (gridScaleEditorOpen) {
    addSlider("grid-scale", "Scale", slicer.gridSizeIn, 0.5, 2, 0.01, 1, slicer.setGridSizeIn);
  } else if (gridThicknessEditorOpen) {
    addSlider("grid-thickness", "Thickness", slicer.gridLineThickness, 1, 10, 0.1, 1, slicer.setGridLineThickness);
  } else if (gridIsoEditorOpen) {
    addSlider("grid-iso", "Iso Angle", slicer.gridPerspectiveAngle, 0, 65, 0.5, 0, slicer.setGridPerspectiveAngle);
  }

  function selectMode(nextMode: Mode) {
    if (nextMode === mode) {
      if (contextOpen) {
        setGridRotationEditorOpen(false);
        setGridColorEditorOpen(false);
        setGridThicknessEditorOpen(false);
        setGridScaleEditorOpen(false);
        setGridIsoEditorOpen(false);
        setImageMenu("root");
        setCurveEditorOpen(false);
        setBrightnessContrastEditorOpen(false);
        setShadowsHighlightsEditorOpen(false);
        setPerspectiveEditorOpen(false);
        setSaturationVibranceEditorOpen(false);
        setLevelsEditorOpen(false);
        setGammaEditorOpen(false);
        setZoomPanSelected(false);
      }
      setContextOpen(!contextOpen);
      return;
    }
    setMode(nextMode);
    setGridRotationEditorOpen(false);
    setGridColorEditorOpen(false);
    setGridThicknessEditorOpen(false);
    setGridScaleEditorOpen(false);
    setGridIsoEditorOpen(false);
    setImageMenu("root");
    setCurveEditorOpen(false);
    setBrightnessContrastEditorOpen(false);
    setShadowsHighlightsEditorOpen(false);
    setPerspectiveEditorOpen(false);
    setSaturationVibranceEditorOpen(false);
    setLevelsEditorOpen(false);
    setGammaEditorOpen(false);
    setZoomPanSelected(false);
    setContextOpen(true);
  }

  return (
    <main style={{ position: "relative", minWidth: 0, minHeight: 0, overflow: "hidden" }}>
      <PreviewPanel
        imageUrl={slicer.imageUrl}
        printedWidthIn={slicer.printedWidthIn}
        printedHeightIn={slicer.printedHeightIn}
        gridMode={slicer.gridMode}
        gridPerspectiveAngle={slicer.gridPerspectiveAngle}
        gridRotation={slicer.gridRotation}
        gridColor={slicer.gridColor}
        gridSizeIn={slicer.gridSizeIn}
        gridPhaseX={slicer.gridPhaseX}
        gridPhaseY={slicer.gridPhaseY}
        gridLineThickness={slicer.gridLineThickness}
        sliceSize={slicer.sliceSize}
        sliceOrientation={slicer.sliceOrientation}
        sliceEstimate={slicer.sliceEstimate}
        sourceSizeReport={slicer.sourceSizeReport}
        sourcePixelWidth={slicer.sourcePixelWidth}
        sourcePixelHeight={slicer.sourcePixelHeight}
        exportDpi={slicer.exportDpi}
        imageAdjustments={slicer.imageAdjustments}
        imageZoom={slicer.imageZoom}
        imageOffsetX={slicer.imageOffsetX}
        imageOffsetY={slicer.imageOffsetY}
        setImageZoom={slicer.setImageZoom}
        setImageOffsetX={slicer.setImageOffsetX}
        setImageOffsetY={slicer.setImageOffsetY}
        setGridSizeIn={slicer.setGridSizeIn}
        setGridPhaseX={slicer.setGridPhaseX}
        setGridPhaseY={slicer.setGridPhaseY}
        touchInteractionMode={mode === "grid" ? "grid" : "image"}
        hideGestureGuidance
        bare
        curveEditorOpen={curveEditorOpen}
        onCurveChange={slicer.setImageCurve}
        onCurveCommit={() => setCurveEditorOpen(false)}
        brightnessContrastEditorOpen={brightnessContrastEditorOpen}
        onBrightnessContrastChange={slicer.setExposureContrast}
        onBrightnessContrastCommit={() => setBrightnessContrastEditorOpen(false)}
        shadowsHighlightsEditorOpen={shadowsHighlightsEditorOpen}
        onShadowsHighlightsChange={slicer.setShadowsHighlights}
        onShadowsHighlightsCommit={() => setShadowsHighlightsEditorOpen(false)}
        perspectiveEditorOpen={perspectiveEditorOpen}
        onPerspectiveChange={slicer.setImagePerspective}
        onPerspectiveCommit={() => setPerspectiveEditorOpen(false)}
        saturationVibranceEditorOpen={saturationVibranceEditorOpen}
        onSaturationVibranceChange={slicer.setSaturationVibrance}
        onSaturationVibranceCommit={() => setSaturationVibranceEditorOpen(false)}
        levelsEditorOpen={levelsEditorOpen}
        onLevelsChange={slicer.setImageLevels}
        onLevelsCommit={() => setLevelsEditorOpen(false)}
        gammaEditorOpen={gammaEditorOpen}
        onGammaChange={slicer.setImageGamma}
        onGammaCommit={() => setGammaEditorOpen(false)}
        gridRotationEditorOpen={gridRotationEditorOpen}
        onGridRotationChange={slicer.setGridRotation}
        onGridRotationCommit={() => setGridRotationEditorOpen(false)}
        gridColorEditorOpen={gridColorEditorOpen}
        onGridColorChange={(color, hue, lightness) => {
          slicer.setGridColor(color);
          setGridColorPosition({ hue, lightness });
        }}
        onGridColorCommit={() => setGridColorEditorOpen(false)}
        gridThicknessEditorOpen={gridThicknessEditorOpen}
        onGridThicknessChange={slicer.setGridLineThickness}
        onGridThicknessCommit={() => setGridThicknessEditorOpen(false)}
        gridScaleEditorOpen={gridScaleEditorOpen}
        onGridScaleChange={slicer.setGridSizeIn}
        onGridScaleCommit={() => setGridScaleEditorOpen(false)}
        gridIsoEditorOpen={gridIsoEditorOpen}
        onGridIsoChange={slicer.setGridPerspectiveAngle}
        onGridIsoCommit={() => setGridIsoEditorOpen(false)}
      />
      <VectorSliderTray sliders={vectorSliders} />

      <nav className="titlebar-floating-menu" aria-label="Interaction mode" style={{ position: "fixed", zIndex: 30, top: "5px", right: "8px", height: "36px", display: "flex", gap: "4px" }}>
        {(contextOpen ? [mode] : ["project", "image", "grid"] as const).map((item) => {
          const selected = contextOpen && mode === item;
          const icon = item === "project" ? projectIcon : item === "image" ? imageIcon : gridIcon;
          const disabled = item !== "project" && !slicer.imageUrl;
          return <button data-selected={selected ? "true" : "false"} key={item} type="button" disabled={disabled} aria-label={`${item} menu`} aria-pressed={selected} title={disabled ? `${item[0].toUpperCase()}${item.slice(1)} — load an image first` : `${item[0].toUpperCase()}${item.slice(1)}`} onClick={() => selectMode(item)} style={buttonStyle}><img src={icon} alt="" aria-hidden="true" /></button>;
        })}
      </nav>
      {contextOpen && <span className="titlebar-menu-divider" aria-hidden="true" style={{ position: "fixed", zIndex: 30, top: "5px", right: "52px" }} />}
      {contextOpen && mode === "image" && imageMenu !== "root" && <span className="titlebar-menu-divider" aria-hidden="true" style={{ position: "fixed", zIndex: 30, top: "5px", right: "106px" }} />}

      {(gridIsoEditorOpen || gridScaleEditorOpen || gridThicknessEditorOpen || gridColorEditorOpen || gridRotationEditorOpen || curveEditorOpen || brightnessContrastEditorOpen || shadowsHighlightsEditorOpen || perspectiveEditorOpen || saturationVibranceEditorOpen || levelsEditorOpen || gammaEditorOpen) && <div role="status" style={{
        position: "absolute",
        zIndex: 10,
        top: "12px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "5px 10px",
        borderRadius: "5px",
        background: "hsl(0 0% 0% / 50%)",
        color: "white",
        fontSize: "13px",
        fontWeight: 700,
        lineHeight: 1.25,
        textAlign: "center",
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}>
        <div style={{ marginBottom: "2px" }}>{activeToolTitle}</div>
        <div style={{ fontWeight: 600 }}>
          {gridIsoEditorOpen
            ? `Angle: ${(90 - slicer.gridPerspectiveAngle).toFixed(1)}° — Rotation: ${slicer.gridRotation.toFixed(1)}°`
            : gridScaleEditorOpen
            ? `Scale: ${slicer.gridSizeIn.toFixed(2)} — Rotation: ${slicer.gridRotation.toFixed(1)}°`
            : gridThicknessEditorOpen
              ? `Thickness: ${slicer.gridLineThickness.toFixed(1)}`
              : gridColorEditorOpen
                ? `Hue: ${gridColorPosition.hue}° — Lightness: ${gridColorPosition.lightness}%`
                : gridRotationEditorOpen
                  ? `Angle: ${slicer.gridRotation.toFixed(1)}°`
                  : curveEditorOpen
                    ? `Input: ${Math.round(slicer.imageAdjustments.curveInput ?? 128)} — Output: ${Math.round(slicer.imageAdjustments.curveOutput ?? 128)}`
                    : brightnessContrastEditorOpen
                      ? `Exposure: ${(slicer.imageAdjustments.exposure ?? 0).toFixed(1)} — Contrast: ${Math.round(slicer.imageAdjustments.contrast)}`
                      : shadowsHighlightsEditorOpen
                        ? `Shadows: ${Math.round(slicer.imageAdjustments.shadows ?? 0)} — Highlights: ${Math.round(slicer.imageAdjustments.highlights ?? 0)}`
                        : perspectiveEditorOpen
                          ? `Amount: ${Math.round(Math.abs(slicer.imageAdjustments.perspective ?? 0) * 100)}% — Edge: ${(slicer.imageAdjustments.perspective ?? 0) >= 0 ? "Top" : "Bottom"}`
                          : saturationVibranceEditorOpen
                            ? `Saturation: ${Math.round(slicer.imageAdjustments.saturation)} — Vibrance: ${Math.round(slicer.imageAdjustments.vibrance ?? 0)}`
                            : levelsEditorOpen
                              ? `Black: ${Math.round(slicer.imageAdjustments.levelsBlack ?? 0)} — White: ${Math.round(slicer.imageAdjustments.levelsWhite ?? 255)}`
                              : `Value: ${slicer.imageAdjustments.gamma.toFixed(2)}`}
        </div>
      </div>}

      <input ref={imageInputRef} type="file" accept="image/*" onChange={slicer.handleFileUpload} style={{ display: "none" }} />
      {contextOpen && <aside className="titlebar-floating-menu" aria-label={`${mode} actions`} style={{ position: "fixed", zIndex: 30, top: "5px", right: "62px", height: "36px", display: "flex", gap: "4px" }}>
        {mode === "project" && <button type="button" aria-label={slicer.imageUrl ? "Replace image" : "Upload image"} title={slicer.imageUrl ? "Replace image" : "Upload image"} onClick={() => imageInputRef.current?.click()} style={buttonStyle}><img src={imageUploadIcon} alt="" aria-hidden="true" /></button>}
        {mode === "grid" && <>
          <button type="button" aria-label="Grid type" title={`Grid type: ${slicer.gridMode}`} onClick={() => {
            const modes = ["none", "line", "dash", "corner"] as const;
            slicer.setGridMode(modes[(modes.indexOf(slicer.gridMode) + 1) % modes.length]);
          }} style={buttonStyle}><img src={lineStyleIcon} alt="" aria-hidden="true" /></button>
          <button data-selected={gridColorEditorOpen ? "true" : "false"} type="button" aria-label="Grid color" title="Grid Color" onClick={() => {
            slicer.setGridColor("black");
            setGridColorPosition({ hue: 0, lightness: 0 });
            setGridRotationEditorOpen(false);
            setGridThicknessEditorOpen(false);
            setGridScaleEditorOpen(false);
            setGridIsoEditorOpen(false);
            setGridColorEditorOpen((open) => !open);
          }} style={buttonStyle}><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="12" fill={slicer.gridColor} stroke="currentColor" strokeWidth="2" /></svg></button>
          <button data-selected={gridIsoEditorOpen ? "true" : "false"} type="button" aria-label="Iso grid angle" title="Iso Grid" onClick={() => {
            slicer.setGridPerspectiveAngle(0);
            slicer.setGridRotation(0);
            setGridColorEditorOpen(false);
            setGridRotationEditorOpen(false);
            setGridThicknessEditorOpen(false);
            setGridScaleEditorOpen(false);
            setGridIsoEditorOpen((open) => !open);
          }} style={buttonStyle}><svg viewBox="0 0 36 36" aria-hidden="true"><path d="M8 7h20l5 22H3L8 7Z" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M18 8v20" stroke="currentColor" strokeWidth="2" /></svg></button>
          <button data-selected={gridScaleEditorOpen ? "true" : "false"} type="button" aria-label="Grid scale" title="Grid Scale" onClick={() => {
            slicer.setGridSizeIn(1);
            slicer.setGridRotation(0);
            setGridColorEditorOpen(false);
            setGridRotationEditorOpen(false);
            setGridThicknessEditorOpen(false);
            setGridIsoEditorOpen(false);
            setGridScaleEditorOpen((open) => !open);
          }} style={buttonStyle}><img className="shadows-highlights-icon" src={gridScaleIcon} alt="" aria-hidden="true" /></button>
          <button data-selected={gridRotationEditorOpen ? "true" : "false"} type="button" aria-label="Grid rotation" title="Grid Rotation" onClick={() => {
            slicer.setGridRotation(0);
            setGridColorEditorOpen(false);
            setGridThicknessEditorOpen(false);
            setGridScaleEditorOpen(false);
            setGridIsoEditorOpen(false);
            setGridRotationEditorOpen((open) => !open);
          }} style={buttonStyle}>
            <img
              className="shadows-highlights-icon"
              src={gridRotationIcon}
              alt=""
              aria-hidden="true"
            />

          </button>
          <button data-selected={gridThicknessEditorOpen ? "true" : "false"} type="button" aria-label="Grid line thickness" title="Grid Thickness" onClick={() => {
            slicer.setGridLineThickness(1);
            setGridColorEditorOpen(false);
            setGridRotationEditorOpen(false);
            setGridScaleEditorOpen(false);
            setGridIsoEditorOpen(false);
            setGridThicknessEditorOpen((open) => !open);
          }} style={buttonStyle}><svg viewBox="0 0 36 36" aria-hidden="true"><path d="M6 11h24M6 18h24M6 26h24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg></button>
        </>}
        {mode === "image" && <>
          {imageMenu === "root" && <button type="button" aria-label="Reset all image adjustments" title="Reset all image adjustments" disabled={!slicer.imageUrl} onClick={() => {
            slicer.resetImageAdjustments();
            slicer.setImageZoom(IMAGE_ADJUSTMENT_CONFIG.zoom.neutral);
            slicer.setImageOffsetX(0);
            slicer.setImageOffsetY(0);
            setCurveEditorOpen(false);
            setBrightnessContrastEditorOpen(false);
            setShadowsHighlightsEditorOpen(false);
            setPerspectiveEditorOpen(false);
            setSaturationVibranceEditorOpen(false);
            setLevelsEditorOpen(false);
            setGammaEditorOpen(false);
            setZoomPanSelected(false);
          }} style={buttonStyle}>
            <img src={resetIcon} alt="" aria-hidden="true" />
          </button>}
          {imageMenu === "root" && <button type="button" aria-label="Rotate image 90 degrees clockwise" title="Rotate image 90° clockwise" disabled={!slicer.imageUrl} onClick={() => void slicer.handleRotateImage90()} style={buttonStyle}>
            <img src={rotate90Icon} alt="" aria-hidden="true" />
          </button>}
          {(imageMenu === "root" || imageMenu === "tone") && <button data-selected={imageMenu === "tone" ? "true" : "false"} type="button" aria-label="Tone and color controls" aria-pressed={imageMenu === "tone"} title="Tone and color" onClick={() => {
            setCurveEditorOpen(false);
            setBrightnessContrastEditorOpen(false);
            setShadowsHighlightsEditorOpen(false);
            setPerspectiveEditorOpen(false);
            setSaturationVibranceEditorOpen(false); setLevelsEditorOpen(false); setGammaEditorOpen(false);
            setImageMenu((current) => current === "tone" ? "root" : "tone");
          }} style={buttonStyle}><img src={toneIcon} alt="" aria-hidden="true" /></button>}
          {(imageMenu === "root" || imageMenu === "transform") && <button data-selected={imageMenu === "transform" ? "true" : "false"} type="button" aria-label="Transform controls" aria-pressed={imageMenu === "transform"} title="Transform" onClick={() => {
            setCurveEditorOpen(false);
            setBrightnessContrastEditorOpen(false);
            setShadowsHighlightsEditorOpen(false);
            setPerspectiveEditorOpen(false);
            setSaturationVibranceEditorOpen(false); setLevelsEditorOpen(false); setGammaEditorOpen(false);
            setImageMenu((current) => current === "transform" ? "root" : "transform");
          }} style={buttonStyle}><img src={transformIcon} alt="" aria-hidden="true" /></button>}
          {imageMenu === "tone" && <div className={`level-three ${activeImageControl ? "has-active" : ""}`} style={{ position: "fixed", zIndex: 30, top: "5px", right: "116px", height: "36px", display: "flex", gap: "4px" }}>
            <button data-selected={curveEditorOpen ? "true" : "false"} type="button" aria-label="Curves" title="Curves" disabled={!slicer.imageUrl} onClick={() => {
              if (curveEditorOpen) { setCurveEditorOpen(false); return; }
              setBrightnessContrastEditorOpen(false); setShadowsHighlightsEditorOpen(false); setPerspectiveEditorOpen(false); setLevelsEditorOpen(false); setGammaEditorOpen(false); setSaturationVibranceEditorOpen(false); setCurveEditorOpen(true);
            }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
              <img
                className="shadows-highlights-icon"
                src={curveIcon}
                alt=""
                aria-hidden="true"
              />
            </button>
            <button data-selected={saturationVibranceEditorOpen ? "true" : "false"} type="button" aria-label="Saturation and vibrance" title="Color Balance" disabled={!slicer.imageUrl} onClick={() => {
              slicer.setSaturationVibrance(IMAGE_ADJUSTMENT_CONFIG.saturation.neutral, IMAGE_ADJUSTMENT_CONFIG.vibrance.neutral);
              if (saturationVibranceEditorOpen) { setSaturationVibranceEditorOpen(false); return; }
              setCurveEditorOpen(false); setBrightnessContrastEditorOpen(false); setShadowsHighlightsEditorOpen(false); setLevelsEditorOpen(false); setGammaEditorOpen(false); setPerspectiveEditorOpen(false); setSaturationVibranceEditorOpen(true);
            }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
              <img src={saturationVibranceIcon} alt="" aria-hidden="true" />
            </button>
            <button data-selected={levelsEditorOpen ? "true" : "false"} type="button" aria-label="Levels" title="Levels" disabled={!slicer.imageUrl} onClick={() => {
              slicer.setImageLevels(IMAGE_ADJUSTMENT_CONFIG.levels.neutralBlack, IMAGE_ADJUSTMENT_CONFIG.levels.neutralWhite);
              if (levelsEditorOpen) { setLevelsEditorOpen(false); return; }
              setCurveEditorOpen(false); setBrightnessContrastEditorOpen(false); setShadowsHighlightsEditorOpen(false); setGammaEditorOpen(false); setSaturationVibranceEditorOpen(false); setPerspectiveEditorOpen(false); setLevelsEditorOpen(true);
            }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
              <img
                className="shadows-highlights-icon"
                src={blackWhiteLevelsIcon}
                alt=""
                aria-hidden="true"
              />
            </button>
            <button data-selected={brightnessContrastEditorOpen ? "true" : "false"} type="button" aria-label="Exposure and contrast" title="Image Tone" disabled={!slicer.imageUrl} onClick={() => {
              slicer.setExposureContrast(IMAGE_ADJUSTMENT_CONFIG.exposure.neutral, IMAGE_ADJUSTMENT_CONFIG.contrast.neutral);
              if (brightnessContrastEditorOpen) {
                setBrightnessContrastEditorOpen(false);
                return;
              }
              setCurveEditorOpen(false);
              setShadowsHighlightsEditorOpen(false);
              setPerspectiveEditorOpen(false);
              setLevelsEditorOpen(false); setGammaEditorOpen(false); setSaturationVibranceEditorOpen(false);
              setBrightnessContrastEditorOpen(true);
            }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
              <img src={brightnessContrastIcon} alt="" aria-hidden="true" style={{ width: "42px", height: "42px" }} />
            </button>
            <button data-selected={shadowsHighlightsEditorOpen ? "true" : "false"} type="button" aria-label="Shadows and highlights" title="Light Balance" disabled={!slicer.imageUrl} onClick={() => {
              slicer.setShadowsHighlights(IMAGE_ADJUSTMENT_CONFIG.shadows.neutral, IMAGE_ADJUSTMENT_CONFIG.highlights.neutral);
              if (shadowsHighlightsEditorOpen) {
                setShadowsHighlightsEditorOpen(false);
                return;
              }
              setCurveEditorOpen(false);
              setBrightnessContrastEditorOpen(false);
              setShadowsHighlightsEditorOpen(true);
              setPerspectiveEditorOpen(false);
              setLevelsEditorOpen(false); setGammaEditorOpen(false); setSaturationVibranceEditorOpen(false);
            }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
              <img
                className="shadows-highlights-icon"
                src={shadowsHighlightsIcon}
                alt=""
                aria-hidden="true"
              />          </button>
            <button data-selected={gammaEditorOpen ? "true" : "false"} type="button" aria-label="Gamma" title="Gamma" disabled={!slicer.imageUrl} onClick={() => {
              slicer.setImageGamma(IMAGE_ADJUSTMENT_CONFIG.gamma.neutral);
              if (gammaEditorOpen) { setGammaEditorOpen(false); return; }
              setCurveEditorOpen(false); setBrightnessContrastEditorOpen(false); setShadowsHighlightsEditorOpen(false); setLevelsEditorOpen(false); setSaturationVibranceEditorOpen(false); setPerspectiveEditorOpen(false); setGammaEditorOpen(true);
            }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
              <img
                className="shadows-highlights-icon"
                src={gammaIcon}
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>}
          {imageMenu === "transform" && <div className={`level-three ${activeImageControl ? "has-active" : ""}`} style={{ position: "fixed", zIndex: 30, top: "5px", right: "116px", height: "36px", display: "flex", gap: "4px" }}>
            <button data-selected={zoomPanSelected ? "true" : "false"} type="button" aria-label="Zoom and pan" title="Zoom and pan" disabled={!slicer.imageUrl} onClick={() => {
              if (zoomPanSelected) { setZoomPanSelected(false); return; }
              setCurveEditorOpen(false);
              setBrightnessContrastEditorOpen(false);
              setShadowsHighlightsEditorOpen(false);
              setPerspectiveEditorOpen(false);
              setSaturationVibranceEditorOpen(false); setLevelsEditorOpen(false); setGammaEditorOpen(false);
              setZoomPanSelected(true);
            }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
              <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m15 15 5 5M10 7v6M7 10h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
            <button data-selected={perspectiveEditorOpen ? "true" : "false"} type="button" aria-label="Perspective" title="Perspective" disabled={!slicer.imageUrl} onClick={() => {
              slicer.setImagePerspective(IMAGE_ADJUSTMENT_CONFIG.perspective.neutral);
              if (perspectiveEditorOpen) {
                setPerspectiveEditorOpen(false);
                return;
              }
              setCurveEditorOpen(false);
              setBrightnessContrastEditorOpen(false);
              setShadowsHighlightsEditorOpen(false);
              setSaturationVibranceEditorOpen(false); setLevelsEditorOpen(false); setGammaEditorOpen(false);
              setZoomPanSelected(false);
              setPerspectiveEditorOpen(true);
            }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
              <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
                <path d="M5 4h14l3 16H2L5 4Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M12 6v12M9 9l3-3 3 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>}
        </>}
      </aside>}
    </main>
  );
}
