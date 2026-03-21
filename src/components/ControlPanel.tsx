import PanelSection from "./ui/PanelSection.tsx";
import SegmentedControl from "./ui/SegmentedControl.tsx";
import NumberWithSlider from "./ui/NumberWithSlider.tsx";
import type { useSlicerState } from "../hooks/useSlicerState.ts";
import GridModeIcon from "./ui/GridModeIcon.tsx";
import { controlLabelStyle } from "./ui/uiStyles.ts";
import ColorSwatchIcon from "./ui/ColorSwatchIcon.tsx";
import LabeledSegmentedControl from "./ui/LabeledSegmentedControl";
import SvgIcon from "./ui/SvgIcon";
import type { GridSize } from "../slicer/types.ts";
import { DEFAULT_GRID_SIZE_IN, DEFAULT_HEIGHT_IN, DEFAULT_WIDTH_IN } from "../slicer/defaults.ts";

type ControlPanelProps = {
    slicer: ReturnType<typeof useSlicerState>;
};

function ControlPanel({ slicer }: ControlPanelProps) {
    return (
        <aside
            style={{
                background: "#d1d5db",
                padding: "5px",
                height: "100%",
                boxSizing: "border-box",
                overflowY: "auto",
            }}
        >
            <h2 style={{ marginTop: 0, marginBottom: "5px" }}>Controls</h2>


            <PanelSection title="Image Controls">
                <div style={{ marginBottom: "5px" }}>
                    <input type="file" accept="image/*" onChange={slicer.handleFileUpload} />
                </div>
                {/*}
                <LabeledSegmentedControl
                    label="Image Adjustments"
                    value="restore"
                    onChange={() => slicer.resetImageAdjustments()}
                    options={[
                        { value: "restore", title: "↻" }

                    ]}
                />
                */}
                <NumberWithSlider
                    label="Bright"
                    value={slicer.imageAdjustments.brightness}
                    min={0}
                    max={200}
                    defaultValue={100}
                    stepInput={1}
                    stepSlider={1}
                    onChange={(value) => slicer.updateImageAdjustment("brightness", value)}
                />

                <NumberWithSlider
                    label="Contrast"
                    value={slicer.imageAdjustments.contrast}
                    min={0}
                    max={200}
                    defaultValue={100}
                    stepInput={1}
                    stepSlider={1}
                    onChange={(value) => slicer.updateImageAdjustment("contrast", value)}
                />

                <NumberWithSlider
                    label="Saturation"
                    value={slicer.imageAdjustments.saturation}
                    min={0}
                    max={200}
                    defaultValue={100}
                    stepInput={1}
                    stepSlider={1}
                    onChange={(value) => slicer.updateImageAdjustment("saturation", value)}
                />

                <NumberWithSlider
                    label="Gamma"
                    value={slicer.imageAdjustments.gamma}
                    min={0.2}
                    max={3}
                    defaultValue={1}
                    stepInput={0.1}
                    stepSlider={0.1}
                    onChange={(value) => slicer.updateImageAdjustment("gamma", value)}
                />
                <NumberWithSlider
                    label="Zoom"
                    value={slicer.imageZoom}
                    defaultValue={100}
                    min={100}
                    max={200}
                    stepInput={1}
                    stepSlider={1}
//                    suffix="%"
                    onChange={(value) => slicer.setImageZoom(value)}
                />

                <NumberWithSlider
                    label="Offset X"
                    value={slicer.imageOffsetX}
                    defaultValue={0}
                    min={-100}
                    max={100}
                    stepInput={1}
                    stepSlider={1}
                    onChange={(value) => slicer.setImageOffsetX(value)}
                />

                <NumberWithSlider
                    label="Offset Y"
                    value={slicer.imageOffsetY}
                    defaultValue={0}
                    min={-100}
                    max={100}
                    stepInput={1}
                    stepSlider={1}
                    onChange={(value) => slicer.setImageOffsetY(value)}
                />

            </PanelSection>
            <PanelSection title="Grid Controls">
                <LabeledSegmentedControl
                    label="Type"
                    value={slicer.gridMode}
                    onChange={(v) => slicer.setGridMode(v)}
                    options={[
                        { value: "none", icon: <SvgIcon name="gridNone" size={20} />, title: "None" },
                        { value: "line", icon: <SvgIcon name="gridLine" size={20} />, title: "Line" },
                        { value: "dash", icon: <SvgIcon name="gridDash" size={20} />, title: "Dash" },
                        { value: "corner", icon: <SvgIcon name="gridCorner" size={20} />, title: "Corner" },
                    ]}
                />
                <NumberWithSlider
                    label="Iso Angle"
                    value={slicer.gridPerspectiveAngle}
                    onChange={slicer.setGridPerspectiveAngle}
                    min={0}
                    max={45}
                    defaultValue={0}
                    stepInput={2.5}
                    stepSlider={2.5}
                />

                <NumberWithSlider
                    label="Rotation"
                    value={slicer.gridRotation}
                    onChange={slicer.setGridRotation}
                    min={-90}
                    max={90}
                    defaultValue={0}
                    stepInput={1}
                    stepSlider={1}
                />
                <LabeledSegmentedControl
                    label="Color"
                    value={slicer.gridColor}
                    onChange={(v) => slicer.setGridColor(v)}
                    options={[
                        { value: "black", icon: <SvgIcon name="colorBlack" size={20} />, title: "Black" },
                        { value: "white", icon: <SvgIcon name="colorWhite" size={20} />, title: "White" },
                    ]}
                />
                <NumberWithSlider
                    label="Size"
                    value={slicer.gridSizeIn}
                    min={0.5}
                    max={1.5}
                    defaultValue={DEFAULT_GRID_SIZE_IN}
                    stepInput={0.1}
                    stepSlider={0.1}
                    onChange={(value) => {slicer.setGridSizeIn(value as GridSize);}}
                />
            </PanelSection>

            <PanelSection title="Output Controls ">
                <NumberWithSlider
                    label="Width"
                    value={slicer.printedWidthIn}
                    min={8}
                    max={36}
                    defaultValue={DEFAULT_WIDTH_IN}
                    onChange={slicer.updateWidth}
                />

                <NumberWithSlider
                    label="Height"
                    value={slicer.printedHeightIn}
                    min={8}
                    max={36}
                    defaultValue={DEFAULT_HEIGHT_IN}
                    onChange={slicer.updateHeight}
                />
                <div style={{ marginBottom: "20px" }}>
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            opacity: slicer.imageAspectRatio ? 1 : 0.6,
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={slicer.maintainAspectRatio}
                            disabled={!slicer.imageAspectRatio}
                            onChange={slicer.handleAspectRatioToggle}
                        />
                        Maintain aspect ratio
                    </label>
                </div>
                <LabeledSegmentedControl
                    label="Slicer"
                    value={slicer.sliceSize}
                    onChange={(v) => slicer.setSliceSize(v)}
                    options={[
                        { value: "8x10", title: "8 x 10" },
                        { value: "8x10.5", title: "8 x 10.5" },
                    ]}
                />
            </PanelSection>
            <button
                type="button"
                disabled={!slicer.imageUrl || slicer.isExporting}
                onClick={slicer.handleExportPdf}
                style={{
                    width: "100%",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    background:
                        !slicer.imageUrl || slicer.isExporting ? "#9ca3af" : "#2563eb",
                    color: "white",
                    fontWeight: 700,
                    cursor:
                        !slicer.imageUrl || slicer.isExporting ? "not-allowed" : "pointer",
                }}
            >
                {slicer.isExporting ? "Exporting PDF..." : "Export PDF"}
            </button>

            {slicer.exportMessage && (
                <div style={{ marginTop: "12px", color: "#4b5563", fontSize: "14px" }}>
                    {slicer.exportMessage}
                </div>
            )}
        </aside>
    );
}

export default ControlPanel;