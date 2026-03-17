import PanelSection from "./ui/PanelSection.tsx";
import SegmentedControl from "./ui/SegmentedControl.tsx";
import NumberWithSlider from "./ui/NumberWithSlider.tsx";
import type { useSlicerState } from "../hooks/useSlicerState.ts";
import GridModeIcon from "./ui/GridModeIcon.tsx";
import { controlLabelStyle } from "./ui/uiStyles.ts";
import ColorSwatchIcon from "./ui/ColorSwatchIcon.tsx";
import LabeledSegmentedControl from "./ui/LabeledSegmentedControl";
import SvgIcon from "./ui/SvgIcon";

type ControlPanelProps = {
    slicer: ReturnType<typeof useSlicerState>;
};

function ControlPanel({ slicer }: ControlPanelProps) {
    return (
        <aside
            style={{
                background: "#d1d5db",
                padding: "5px",
                minHeight: "100%",
                boxSizing: "border-box",
                overflowY: "auto",
            }}
        >
            <h2 style={{ marginTop: 0 }}>Controls</h2>


            <PanelSection title="Image">
                <div style={{ marginBottom: "8px" }}>
                    <input type="file" accept="image/*" onChange={slicer.handleFileUpload} />
                </div>

                <LabeledSegmentedControl
                    label="Image Adjustments"
                    value="restore"
                    onChange={() => slicer.resetImageAdjustments()}
                    options={[
                        { value: "restore", title: "↻" }

                    ]}
                />
                <NumberWithSlider
                    label="Brightness"
                    value={slicer.imageAdjustments.brightness}
                    min={0}
                    max={200}
                    stepInput={1}
                    stepSlider={1}
                    onChange={(value) => slicer.updateImageAdjustment("brightness", value)}
                />

                <NumberWithSlider
                    label="Contrast"
                    value={slicer.imageAdjustments.contrast}
                    min={0}
                    max={200}
                    stepInput={1}
                    stepSlider={1}
                    onChange={(value) => slicer.updateImageAdjustment("contrast", value)}
                />

                <NumberWithSlider
                    label="Saturation"
                    value={slicer.imageAdjustments.saturation}
                    min={0}
                    max={200}
                    stepInput={1}
                    stepSlider={1}
                    onChange={(value) => slicer.updateImageAdjustment("saturation", value)}
                />

                <NumberWithSlider
                    label="Gamma"
                    value={slicer.imageAdjustments.gamma}
                    min={0.2}
                    max={3}
                    stepInput={0.1}
                    stepSlider={0.1}
                    onChange={(value) => slicer.updateImageAdjustment("gamma", value)}
                />

            </PanelSection>
            <PanelSection title="Grid">
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
                    min={0.75}
                    max={1.5}
                    stepInput={0.125}
                    stepSlider={0.125}
                    onChange={slicer.setGridSizeIn}
                />
            </PanelSection>

            <PanelSection title="Output">
                <NumberWithSlider
                    label="Width"
                    value={slicer.printedWidthIn}
                    min={8}
                    max={36}
                    onChange={slicer.updateWidth}
                />

                <NumberWithSlider
                    label="Height"
                    value={slicer.printedHeightIn}
                    min={8}
                    max={36}
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