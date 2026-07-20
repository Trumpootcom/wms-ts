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
import { theme } from "../theme.ts";
import PreviewPanel from "./PreviewPanel.tsx";

type Mode = "image" | "grid";
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

  function selectMode(nextMode: Mode) {
    if (nextMode === mode) {
      if (contextOpen) {
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
        touchInteractionMode={mode}
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
      />

      <nav className="titlebar-floating-menu" aria-label="Interaction mode" style={{ position: "fixed", zIndex: 30, top: "5px", right: "8px", height: "36px", display: "flex", gap: "4px" }}>
        {(contextOpen ? [mode] : ["image", "grid"] as const).map((item) => {
          const selected = contextOpen && mode === item;
          return <button data-selected={selected ? "true" : "false"} key={item} type="button" aria-label={`${item} mode`} aria-pressed={selected} title={`${item[0].toUpperCase()}${item.slice(1)} mode`} onClick={() => selectMode(item)} style={buttonStyle}><img src={item === "image" ? imageIcon : gridIcon} alt="" aria-hidden="true" /></button>;
        })}
      </nav>
      {contextOpen && mode === "image" && <span className="titlebar-menu-divider" aria-hidden="true" style={{ position: "fixed", zIndex: 30, top: "5px", right: "52px" }} />}
      {contextOpen && mode === "image" && imageMenu !== "root" && <span className="titlebar-menu-divider" aria-hidden="true" style={{ position: "fixed", zIndex: 30, top: "5px", right: "106px" }} />}

      {(curveEditorOpen || brightnessContrastEditorOpen || shadowsHighlightsEditorOpen || perspectiveEditorOpen || saturationVibranceEditorOpen || levelsEditorOpen || gammaEditorOpen) && <div role="status" style={{
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
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}>
        {curveEditorOpen
          ? `Input: ${Math.round(slicer.imageAdjustments.curveInput ?? 128)} — Output: ${Math.round(slicer.imageAdjustments.curveOutput ?? 128)}`
          : brightnessContrastEditorOpen
            ? `Exposure: ${(slicer.imageAdjustments.exposure ?? 0).toFixed(1)} — Contrast: ${Math.round(slicer.imageAdjustments.contrast)}`
            : shadowsHighlightsEditorOpen
              ? `Shadows: ${Math.round(slicer.imageAdjustments.shadows ?? 0)} — Highlights: ${Math.round(slicer.imageAdjustments.highlights ?? 0)}`
              : perspectiveEditorOpen
                ? `Perspective: ${Math.round(Math.abs(slicer.imageAdjustments.perspective ?? 0) * 100)}% ${(slicer.imageAdjustments.perspective ?? 0) >= 0 ? "Top" : "Bottom"}`
                : saturationVibranceEditorOpen
                  ? `Saturation: ${Math.round(slicer.imageAdjustments.saturation)} — Vibrance: ${Math.round(slicer.imageAdjustments.vibrance ?? 0)}`
                  : levelsEditorOpen
                    ? `Black: ${Math.round(slicer.imageAdjustments.levelsBlack ?? 0)} — White: ${Math.round(slicer.imageAdjustments.levelsWhite ?? 255)}`
                    : `Gamma: ${slicer.imageAdjustments.gamma.toFixed(2)}`}
      </div>}

      {contextOpen && mode === "image" && <aside className="titlebar-floating-menu" aria-label={`${mode} actions`} style={{ position: "fixed", zIndex: 30, top: "5px", right: "62px", height: "36px", display: "flex", gap: "4px" }}>
        {mode === "image" && <>
          {imageMenu === "root" && <button type="button" aria-label={slicer.imageUrl ? "Replace image" : "Open image"} title={slicer.imageUrl ? "Replace image" : "Open image"} onClick={() => imageInputRef.current?.click()} style={buttonStyle}>↥</button>}
          <input ref={imageInputRef} type="file" accept="image/*" onChange={slicer.handleFileUpload} style={{ display: "none" }} />
          {imageMenu === "root" && <button type="button" aria-label="Reset all image adjustments" title="Reset all image adjustments" disabled={!slicer.imageUrl} onClick={() => {
            slicer.resetImageAdjustments();
            slicer.setImageZoom(100);
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
              if (curveEditorOpen) {
                setCurveEditorOpen(false);
                return;
              }
              setBrightnessContrastEditorOpen(false);
              setShadowsHighlightsEditorOpen(false);
              setPerspectiveEditorOpen(false);
              setLevelsEditorOpen(false); setGammaEditorOpen(false); setSaturationVibranceEditorOpen(false);
              setCurveEditorOpen(true);
            }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
              <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
                <path d="M3 3v18h18" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 19C8 18 7 9 12 7s6-3 9-3" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="7" r="1.8" fill="currentColor" />
              </svg>
            </button>
            <button data-selected={brightnessContrastEditorOpen ? "true" : "false"} type="button" aria-label="Exposure and contrast" title="Exposure and contrast" disabled={!slicer.imageUrl} onClick={() => {
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
            <button data-selected={shadowsHighlightsEditorOpen ? "true" : "false"} type="button" aria-label="Shadows and highlights" title="Shadows and highlights" disabled={!slicer.imageUrl} onClick={() => {
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
            <button data-selected={levelsEditorOpen ? "true" : "false"} type="button" aria-label="Levels" title="Levels: black and white points" disabled={!slicer.imageUrl} onClick={() => {
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
            <button data-selected={gammaEditorOpen ? "true" : "false"} type="button" aria-label="Gamma" title="Gamma" disabled={!slicer.imageUrl} onClick={() => {
              if (gammaEditorOpen) { setGammaEditorOpen(false); return; }
              setCurveEditorOpen(false); setBrightnessContrastEditorOpen(false); setShadowsHighlightsEditorOpen(false); setLevelsEditorOpen(false); setSaturationVibranceEditorOpen(false); setPerspectiveEditorOpen(false); setGammaEditorOpen(true);
            }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
              <svg viewBox="0 0 36 36" aria-hidden="true">
                <text x="18" y="18" dy="0.08em" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontFamily="Georgia, serif" fontSize="34" fontStyle="italic">γ</text>
              </svg>
            </button>
            <button data-selected={saturationVibranceEditorOpen ? "true" : "false"} type="button" aria-label="Saturation and vibrance" title="Saturation and vibrance" disabled={!slicer.imageUrl} onClick={() => {
              if (saturationVibranceEditorOpen) { setSaturationVibranceEditorOpen(false); return; }
              setCurveEditorOpen(false); setBrightnessContrastEditorOpen(false); setShadowsHighlightsEditorOpen(false); setLevelsEditorOpen(false); setGammaEditorOpen(false); setPerspectiveEditorOpen(false); setSaturationVibranceEditorOpen(true);
            }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
              <img src={saturationVibranceIcon} alt="" aria-hidden="true" />
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
