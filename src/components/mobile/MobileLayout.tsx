import { useRef, useState } from "react";
import type { useSlicerState } from "../../hooks/useSlicerState.ts";
import type { GridSize } from "../../slicer/types.ts";
import { DEFAULT_GRID_SIZE_IN, DEFAULT_HEIGHT_IN, DEFAULT_WIDTH_IN } from "../../slicer/defaults.ts";
import { theme } from "../../theme.ts";
import PreviewPanel from "../PreviewPanel.tsx";
import ExportActions from "../controls/ExportActions.tsx";
import ProjectsPane from "../controls/ProjectsPane.tsx";
import SvgIcon from "../ui/SvgIcon.tsx";
import { MobileSegmentedControl, MobileSliderControl, type FocusedControl, type MobilePaneName } from "./MobileControls.tsx";

type Props = { slicer: ReturnType<typeof useSlicerState> };

function DockIcon({ pane }: { pane: MobilePaneName }) {
  const symbols: Record<MobilePaneName, string> = { Projects: "▰", Image: "▧", Grid: "▦", Page: "▤", Export: "⇧" };
  return <span aria-hidden="true" style={{ fontSize: pane === "Export" ? "27px" : "24px", lineHeight: 1 }}>{symbols[pane]}</span>;
}

export default function MobileLayout({ slicer }: Props) {
  const [activePane, setActivePane] = useState<MobilePaneName | null>(null);
  const [focused, setFocused] = useState<FocusedControl | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const panes: MobilePaneName[] = ["Projects", "Image", "Grid", "Page", "Export"];

  function selectPane(pane: MobilePaneName) {
    if (activePane === pane) {
      setActivePane(null);
      setFocused(null);
    } else {
      setActivePane(pane);
      setFocused(null);
    }
  }

  const show = (id: string) => !focused || focused.id === id;
  const isFocused = (id: string) => focused?.id === id;
  const focus = (control: FocusedControl) => setFocused(control);

  function renderImage() {
    return <div style={{ display: "grid", gap: "2px" }}>
      {!focused && <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: "8px", alignItems: "center", marginBottom: "5px" }}>
        <button type="button" onClick={() => imageInputRef.current?.click()} style={{ minHeight: "36px", border: `1px solid ${theme.control.buttonBorder}`, borderRadius: "6px", background: theme.control.buttonPrimary, fontWeight: 700 }}>Choose Image</button>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "12px" }}>{slicer.imageUrl ? slicer.imageFileName : "No image selected"}</span>
        <input ref={imageInputRef} type="file" accept="image/*" onChange={slicer.handleFileUpload} style={{ display: "none" }} />
      </div>}
      {show("brightness") && <MobileSliderControl pane="Image" id="brightness" label="Brightness" value={slicer.imageAdjustments.brightness} min={0} max={200} step={1} defaultValue={100} onChange={(v) => slicer.updateImageAdjustment("brightness", v)} focused={isFocused("brightness")} onFocus={focus} />}
      {show("contrast") && <MobileSliderControl pane="Image" id="contrast" label="Contrast" value={slicer.imageAdjustments.contrast} min={0} max={200} step={1} defaultValue={100} onChange={(v) => slicer.updateImageAdjustment("contrast", v)} focused={isFocused("contrast")} onFocus={focus} />}
      {show("saturation") && <MobileSliderControl pane="Image" id="saturation" label="Saturation" value={slicer.imageAdjustments.saturation} min={0} max={200} step={1} defaultValue={100} onChange={(v) => slicer.updateImageAdjustment("saturation", v)} focused={isFocused("saturation")} onFocus={focus} />}
      {show("gamma") && <MobileSliderControl pane="Image" id="gamma" label="Gamma" value={slicer.imageAdjustments.gamma} min={0.2} max={3} step={0.1} defaultValue={1} onChange={(v) => slicer.updateImageAdjustment("gamma", v)} focused={isFocused("gamma")} onFocus={focus} />}
      {show("zoom") && <MobileSliderControl pane="Image" id="zoom" label="Zoom" value={slicer.imageZoom} min={100} max={200} step={0.1} defaultValue={100} onChange={slicer.setImageZoom} focused={isFocused("zoom")} onFocus={focus} />}
      {show("image-x") && <MobileSliderControl pane="Image" id="image-x" label="Offset X" value={slicer.imageOffsetX} min={-100} max={100} step={0.1} defaultValue={0} onChange={slicer.setImageOffsetX} focused={isFocused("image-x")} onFocus={focus} />}
      {show("image-y") && <MobileSliderControl pane="Image" id="image-y" label="Offset Y" value={slicer.imageOffsetY} min={-100} max={100} step={0.1} defaultValue={0} onChange={slicer.setImageOffsetY} focused={isFocused("image-y")} onFocus={focus} />}
    </div>;
  }

  function renderGrid() {
    return <div style={{ display: "grid", gap: "2px" }}>
      {show("grid-type") && <MobileSegmentedControl pane="Grid" id="grid-type" label="Type" value={slicer.gridMode} defaultValue="line" onChange={slicer.setGridMode} focused={isFocused("grid-type")} onFocus={focus} options={[
        { value: "none", title: "None", content: <SvgIcon name="gridNone" /> }, { value: "line", title: "Line", content: <SvgIcon name="gridLine" /> }, { value: "dash", title: "Dash", content: <SvgIcon name="gridDash" /> }, { value: "corner", title: "Corner", content: <SvgIcon name="gridCorner" /> },
      ]} />}
      {show("grid-color") && <MobileSegmentedControl pane="Grid" id="grid-color" label="Color" value={slicer.gridColor} defaultValue="black" onChange={slicer.setGridColor} focused={isFocused("grid-color")} onFocus={focus} options={[
        { value: "black", title: "Black", content: <SvgIcon name="colorBlack" /> }, { value: "gray", title: "Gray", content: <SvgIcon name="colorGray" /> }, { value: "white", title: "White", content: <SvgIcon name="colorWhite" /> }, { value: "red", title: "Red", content: <SvgIcon name="colorRed" /> }, { value: "blue", title: "Blue", content: <SvgIcon name="colorBlue" /> },
      ]} />}
      {show("iso") && <MobileSliderControl pane="Grid" id="iso" label="Iso Angle" value={slicer.gridPerspectiveAngle} min={0} max={45} step={2.5} defaultValue={0} onChange={slicer.setGridPerspectiveAngle} focused={isFocused("iso")} onFocus={focus} />}
      {show("rotation") && <MobileSliderControl pane="Grid" id="rotation" label="Rotation" value={slicer.gridRotation} min={-90} max={90} step={0.5} defaultValue={0} onChange={slicer.setGridRotation} focused={isFocused("rotation")} onFocus={focus} />}
      {show("grid-size") && <MobileSliderControl pane="Grid" id="grid-size" label="Size" value={slicer.gridSizeIn} min={0.5} max={1.5} step={0.01} defaultValue={DEFAULT_GRID_SIZE_IN} onChange={(v) => slicer.setGridSizeIn(v as GridSize)} focused={isFocused("grid-size")} onFocus={focus} />}
      {show("stroke") && <MobileSliderControl pane="Grid" id="stroke" label="Stroke" value={slicer.gridLineThickness} min={1} max={5} step={0.1} defaultValue={1} onChange={slicer.setGridLineThickness} focused={isFocused("stroke")} onFocus={focus} />}
      {show("grid-x") && <MobileSliderControl pane="Grid" id="grid-x" label="X Offset" value={slicer.gridPhaseX} min={-1} max={1} step={0.01} defaultValue={0} onChange={slicer.setGridPhaseX} focused={isFocused("grid-x")} onFocus={focus} />}
      {show("grid-y") && <MobileSliderControl pane="Grid" id="grid-y" label="Y Offset" value={slicer.gridPhaseY} min={-1} max={1} step={0.01} defaultValue={0} onChange={slicer.setGridPhaseY} focused={isFocused("grid-y")} onFocus={focus} />}
    </div>;
  }

  function renderPage() {
    return <div style={{ display: "grid", gap: "2px" }}>
      {show("width") && <MobileSliderControl pane="Page" id="width" label="Width" value={slicer.printedWidthIn} min={8} max={36} defaultValue={DEFAULT_WIDTH_IN} onChange={slicer.updateWidth} focused={isFocused("width")} onFocus={focus} />}
      {show("height") && <MobileSliderControl pane="Page" id="height" label="Height" value={slicer.printedHeightIn} min={8} max={36} defaultValue={DEFAULT_HEIGHT_IN} onChange={slicer.updateHeight} focused={isFocused("height")} onFocus={focus} />}
      {show("orientation") && <MobileSegmentedControl pane="Page" id="orientation" label="Orient" value={slicer.sliceOrientation} defaultValue="portrait" onChange={slicer.setSliceOrientation} focused={isFocused("orientation")} onFocus={focus} options={[{ value: "portrait", title: "Portrait" }, { value: "landscape", title: "Landscape" }]} />}
      {show("slicer") && <MobileSegmentedControl pane="Page" id="slicer" label="Slicer" value={slicer.sliceSize} defaultValue="8x10" onChange={slicer.setSliceSize} focused={isFocused("slicer")} onFocus={focus} options={[{ value: "8x10", title: "8 × 10" }, { value: "8x10.5", title: "8 × 10.5" }, { value: "ledger", title: "Ledger" }]} />}
      {!focused && <label style={{ minHeight: "40px", display: "flex", alignItems: "center", gap: "9px", fontWeight: 700 }}><input type="checkbox" checked={slicer.maintainAspectRatio} disabled={!slicer.imageAspectRatio} onChange={slicer.handleAspectRatioToggle} />Maintain aspect ratio</label>}
    </div>;
  }

  function renderActivePane() {
    if (activePane === "Projects") return <ProjectsPane slicer={slicer} />;
    if (activePane === "Image") return renderImage();
    if (activePane === "Grid") return renderGrid();
    if (activePane === "Page") return renderPage();
    if (activePane === "Export") return <div style={{ display: "grid", gap: "10px" }}><ExportActions slicer={slicer} />{slicer.exportMessage && <div style={{ color: theme.panel.mutedText, fontSize: "13px" }}>{slicer.exportMessage}</div>}</div>;
    return null;
  }

  return (
    <main style={{ minHeight: 0, display: "grid", gridTemplateRows: focused ? "minmax(0, 1fr) auto 58px" : activePane ? "minmax(180px, 1fr) minmax(72px, 45dvh) 58px" : "minmax(0, 1fr) 58px", overflow: "hidden", padding: "6px 6px max(6px, env(safe-area-inset-bottom))", gap: "6px", boxSizing: "border-box" }}>
      <div style={{ minHeight: 0 }}><PreviewPanel imageUrl={slicer.imageUrl} printedWidthIn={slicer.printedWidthIn} printedHeightIn={slicer.printedHeightIn} gridMode={slicer.gridMode} gridPerspectiveAngle={slicer.gridPerspectiveAngle} gridRotation={slicer.gridRotation} gridColor={slicer.gridColor} gridSizeIn={slicer.gridSizeIn} gridPhaseX={slicer.gridPhaseX} gridPhaseY={slicer.gridPhaseY} gridLineThickness={slicer.gridLineThickness} sliceSize={slicer.sliceSize} sliceOrientation={slicer.sliceOrientation} sliceEstimate={slicer.sliceEstimate} sourceSizeReport={slicer.sourceSizeReport} sourcePixelWidth={slicer.sourcePixelWidth} sourcePixelHeight={slicer.sourcePixelHeight} exportDpi={slicer.exportDpi} imageAdjustments={slicer.imageAdjustments} imageZoom={slicer.imageZoom} imageOffsetX={slicer.imageOffsetX} imageOffsetY={slicer.imageOffsetY} setImageZoom={slicer.setImageZoom} setImageOffsetX={slicer.setImageOffsetX} setImageOffsetY={slicer.setImageOffsetY} setGridSizeIn={slicer.setGridSizeIn} setGridPhaseX={slicer.setGridPhaseX} setGridPhaseY={slicer.setGridPhaseY} /></div>
      {activePane && <section style={{ minHeight: 0, display: "grid", gridTemplateRows: "40px minmax(0, 1fr)", border: `1px solid ${theme.panel.border}`, borderRadius: "8px", overflow: "hidden", background: theme.panel.background }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", background: theme.panel.headerBackground, borderBottom: `1px solid ${theme.panel.headerBorder}`, fontWeight: 800 }}>
          <span>{activePane}{focused ? ` › ${focused.label}` : ""}</span>
          <button type="button" aria-label={focused ? "Return to full pane" : `Close ${activePane}`} onClick={() => focused ? setFocused(null) : setActivePane(null)} style={{ width: "30px", height: "30px", border: `1px solid ${theme.control.buttonBorder}`, borderRadius: "6px", background: theme.control.buttonPrimary, fontWeight: 800 }}>×</button>
        </header>
        <div style={{ minHeight: 0, overflow: "auto", padding: "8px", boxSizing: "border-box" }}>{renderActivePane()}</div>
      </section>}
      <nav aria-label="Mobile tool panes" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "5px" }}>
        {panes.map((pane) => <button key={pane} type="button" aria-label={`${pane} pane`} title={pane} onClick={() => selectPane(pane)} style={{ minWidth: 0, border: `2px solid ${activePane === pane ? theme.control.selectedBorder : theme.control.buttonBorder}`, borderRadius: "9px", background: activePane === pane ? theme.control.selectedBackground : `linear-gradient(${theme.control.buttonPrimaryTop}, ${theme.control.buttonPrimaryBottom})`, color: theme.control.buttonText, boxShadow: theme.control.buttonInsetHighlight }}><DockIcon pane={pane} /></button>)}
      </nav>
    </main>
  );
}
