import { useRef, useState } from "react";
import type { useSlicerState } from "../hooks/useSlicerState.ts";
import imageIcon from "../assets/image.svg";
import gridIcon from "../assets/grid.svg";
import brightnessContrastIcon from "../assets/brightness-contrast.svg";
import { theme } from "../theme.ts";
import PreviewPanel from "./PreviewPanel.tsx";
import { IMAGE_ADJUSTMENT_CONFIG } from "../slicer/imageAdjustmentConfig.ts";

type Mode = "image" | "grid";
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
  const [contextOpen, setContextOpen] = useState(true);
  const [curveEditorOpen, setCurveEditorOpen] = useState(false);
  const [brightnessContrastEditorOpen, setBrightnessContrastEditorOpen] = useState(false);
  const [shadowsHighlightsEditorOpen, setShadowsHighlightsEditorOpen] = useState(false);
  const [perspectiveEditorOpen, setPerspectiveEditorOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  function selectMode(nextMode: Mode) {
    if (nextMode === mode) {
      setContextOpen((open) => !open);
      return;
    }
    setMode(nextMode);
    setCurveEditorOpen(false);
    setBrightnessContrastEditorOpen(false);
    setShadowsHighlightsEditorOpen(false);
    setPerspectiveEditorOpen(false);
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
      />

      <nav aria-label="Interaction mode" style={{ position: "absolute", zIndex: 10, top: "12px", left: "12px", display: "grid", gap: "8px" }}>
        {(["image", "grid"] as const).map((item) => {
          const selected = mode === item;
          return <button key={item} type="button" aria-label={`${item} mode`} aria-pressed={selected} title={`${item[0].toUpperCase()}${item.slice(1)} mode`} onClick={() => selectMode(item)} style={{ ...buttonStyle, border: `2px solid ${selected ? theme.control.selectedBorder : theme.control.buttonBorder}`, background: selected ? "hsl(42 72% 76% / 88%)" : "hsl(42 55% 88% / 72%)" }}><img src={item === "image" ? imageIcon : gridIcon} alt="" aria-hidden="true" style={{ width: "42px", height: "42px" }} /></button>;
        })}
      </nav>

      {(curveEditorOpen || brightnessContrastEditorOpen || shadowsHighlightsEditorOpen || perspectiveEditorOpen) && <div role="status" style={{
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
              : `Perspective: ${Math.round(Math.abs(slicer.imageAdjustments.perspective ?? 0) * 100)}% ${(slicer.imageAdjustments.perspective ?? 0) >= 0 ? "Top" : "Bottom"}`}
      </div>}

      {contextOpen && <aside aria-label={`${mode} actions`} style={{ position: "absolute", zIndex: 10, top: "12px", right: "12px", display: "grid", gap: "8px" }}>
        {mode === "image" && <>
          <button type="button" aria-label={slicer.imageUrl ? "Replace image" : "Open image"} title={slicer.imageUrl ? "Replace image" : "Open image"} onClick={() => imageInputRef.current?.click()} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)" }}>↥</button>
          <input ref={imageInputRef} type="file" accept="image/*" onChange={slicer.handleFileUpload} style={{ display: "none" }} />
          <button type="button" aria-label="Curves" title="Curves" disabled={!slicer.imageUrl} onClick={() => {
            if (curveEditorOpen) {
              setCurveEditorOpen(false);
              return;
            }
            slicer.setImageCurve(IMAGE_ADJUSTMENT_CONFIG.curve.neutralInput, IMAGE_ADJUSTMENT_CONFIG.curve.neutralOutput);
            setBrightnessContrastEditorOpen(false);
            setShadowsHighlightsEditorOpen(false);
            setPerspectiveEditorOpen(false);
            setCurveEditorOpen(true);
          }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
            <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
              <path d="M3 3v18h18" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 19C8 18 7 9 12 7s6-3 9-3" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="7" r="1.8" fill="currentColor" />
            </svg>
          </button>
          <button type="button" aria-label="Exposure and contrast" title="Exposure and contrast" disabled={!slicer.imageUrl} onClick={() => {
            if (brightnessContrastEditorOpen) {
              setBrightnessContrastEditorOpen(false);
              return;
            }
            slicer.setExposureContrast(IMAGE_ADJUSTMENT_CONFIG.exposure.neutral, IMAGE_ADJUSTMENT_CONFIG.contrast.neutral);
            setCurveEditorOpen(false);
            setShadowsHighlightsEditorOpen(false);
            setPerspectiveEditorOpen(false);
            setBrightnessContrastEditorOpen(true);
          }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
            <img src={brightnessContrastIcon} alt="" aria-hidden="true" style={{ width: "42px", height: "42px" }} />
          </button>
          <button type="button" aria-label="Shadows and highlights" title="Shadows and highlights" disabled={!slicer.imageUrl} onClick={() => {
            if (shadowsHighlightsEditorOpen) {
              setShadowsHighlightsEditorOpen(false);
              return;
            }
            slicer.setShadowsHighlights(IMAGE_ADJUSTMENT_CONFIG.shadows.neutral, IMAGE_ADJUSTMENT_CONFIG.highlights.neutral);
            setCurveEditorOpen(false);
            setBrightnessContrastEditorOpen(false);
            setShadowsHighlightsEditorOpen(true);
            setPerspectiveEditorOpen(false);
          }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
            <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
              <circle cx="8" cy="12" r="6" fill="currentColor" opacity="0.9" />
              <circle cx="16" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M16 6a6 6 0 0 0 0 12Z" fill="currentColor" opacity="0.35" />
            </svg>
          </button>
          <button type="button" aria-label="Perspective" title="Perspective" disabled={!slicer.imageUrl} onClick={() => {
            if (perspectiveEditorOpen) {
              setPerspectiveEditorOpen(false);
              return;
            }
            slicer.setImagePerspective(IMAGE_ADJUSTMENT_CONFIG.perspective.neutral);
            setCurveEditorOpen(false);
            setBrightnessContrastEditorOpen(false);
            setShadowsHighlightsEditorOpen(false);
            setPerspectiveEditorOpen(true);
          }} style={{ ...buttonStyle, border: `1px solid ${theme.control.buttonBorder}`, background: "hsl(42 55% 88% / 78%)", opacity: slicer.imageUrl ? 1 : 0.45 }}>
            <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
              <path d="M5 4h14l3 16H2L5 4Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M12 6v12M9 9l3-3 3 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>}
      </aside>}
    </main>
  );
}
