import PanelSection from "./ui/PanelSection.tsx";
import SegmentedControl from "./ui/SegmentedControl.tsx";
import NumberWithSlider from "./ui/NumberWithSlider.tsx";
import type { useSlicerState } from "../hooks/useSlicerState.ts";
import GridModeIcon from "./ui/GridModeIcon.tsx";
import { controlLabelStyle } from "./ui/uiStyles.ts";

type ControlPanelProps = {
    slicer: ReturnType<typeof useSlicerState>;
};

function ControlPanel({ slicer }: ControlPanelProps) {
    return (
        <aside
            style={{
                background: "#d1d5db",
                padding: "16px",
                minHeight: "100%",
                boxSizing: "border-box",
                overflowY: "auto",
            }}
        >
            <h2 style={{ marginTop: 0 }}>Controls</h2>

            <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>
                    Upload Map
                </label>
                <input type="file" accept="image/*" onChange={slicer.handleFileUpload} />
            </div>

            <PanelSection title="Image Adjustments">
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

                <button
                    type="button"
                    onClick={slicer.resetImageAdjustments}
                    style={{
                        width: "100%",
                        border: "1px solid #9ca3af",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        background: "#f9fafb",
                        color: "#111827",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    Reset Adjustments
                </button>
            </PanelSection>
            <NumberWithSlider
                label="Print Wid (in)"
                value={slicer.printedWidthIn}
                min={8}
                max={36}
                onChange={slicer.updateWidth}
            />

            <NumberWithSlider
                label="Print Ht (in)"
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

            <PanelSection title="Grid">

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        marginBottom: "12px",
                    }}
                >
                    <div style={controlLabelStyle}>Type</div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "4px",
                        }}
                    >
                        {(["none", "line", "dash", "corner"] as const).map((mode) => {
                            const selected = slicer.gridMode === mode;

                            return (
                                <button
                                    key={mode}
                                    type="button"
                                    title={
                                        mode === "none"
                                            ? "None"
                                            : mode === "line"
                                                ? "Line"
                                                : mode === "dash"
                                                    ? "Dash"
                                                    : "Corner"
                                    }
                                    onClick={() => slicer.setGridMode(mode)}
                                    style={{
                                        padding: "4px",
                                        border: selected ? "2px solid #1d4ed8" : "1px solid #9ca3af",
                                        borderRadius: "8px",
                                        background: selected ? "#dbeafe" : "#f3f4f6",
                                        color: "#111827",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flex: "0 0 auto",
                                    }}
                                >
                                    <GridModeIcon mode={mode} size={20} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div style={{ marginBottom: "8px", fontWeight: 700 }}>Grid Color</div>

                <SegmentedControl
                    value={slicer.gridColor}
                    onChange={slicer.setGridColor}
                    marginBottom="12px"
                    isLightOption={(value) => value === "white"}
                    options={[
                        { value: "black", label: "Black" },
                        { value: "white", label: "White" },
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

            <PanelSection title="Slice Size">
                <SegmentedControl
                    value={slicer.sliceSize}
                    onChange={slicer.setSliceSize}
                    options={[
                        { value: "8x10", label: "8 × 10" },
                        { value: "8x10.5", label: "8 × 10.5" },
                    ]}
                />
            </PanelSection>

            <PanelSection title="Page Estimate">
                <div>
                    Estimated tiles: {slicer.sliceEstimate.cols} ×{" "}
                    {slicer.sliceEstimate.rows}
                </div>
                <div>Estimated pages: {slicer.sliceEstimate.total}</div>
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