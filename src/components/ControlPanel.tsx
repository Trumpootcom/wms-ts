import PanelSection from "./ui/PanelSection.tsx";
import SegmentedControl from "./ui/SegmentedControl.tsx";
import NumberWithSlider from "./ui/NumberWithSlider.tsx";
import type { useSlicerState } from "../hooks/useSlicerState.ts";

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
                <SegmentedControl
                    value={slicer.gridMode}
                    onChange={slicer.setGridMode}
                    marginBottom="12px"
                    options={[
                        { value: "none", label: "None" },
                        { value: "line", label: "Line" },
                        { value: "dash", label: "Dash" },
                        { value: "corner", label: "Corner" },
                    ]}
                />

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

                <div style={{ marginBottom: "8px", fontWeight: 700 }}>Grid Size (in)</div>

                <SegmentedControl
                    value={slicer.gridSizeIn}
                    onChange={slicer.setGridSizeIn}
                    wrap
                    options={[
                        { value: 0.75, label: '0.75"' },
                        { value: 1, label: '1"' },
                        { value: 1.25, label: '1.25"' },
                        { value: 1.5, label: '1.5"' },
                    ]}
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