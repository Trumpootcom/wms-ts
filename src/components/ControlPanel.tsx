import { useRef } from "react";
import PanelSection from "./ui/PanelSection.tsx";
import NumberWithSlider from "./ui/NumberWithSlider.tsx";
import type { useSlicerState } from "../hooks/useSlicerState.ts";
import LabeledSegmentedControl from "./ui/LabeledSegmentedControl";
import SvgIcon from "./ui/SvgIcon";
import type { GridSize } from "../slicer/types.ts";
import { DEFAULT_GRID_SIZE_IN, DEFAULT_HEIGHT_IN, DEFAULT_WIDTH_IN } from "../slicer/defaults.ts";
import { theme } from "../theme.ts";

type ControlPanelProps = {
    slicer: ReturnType<typeof useSlicerState>;
};

function ControlPanel({ slicer }: ControlPanelProps) {
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const projectOpenInputRef = useRef<HTMLInputElement | null>(null);

    return (
        <aside
            style={{
                display: "grid",
                gridAutoRows: "max-content",
                gap: "8px",
            }}
        >
            {/* <h2 style={{ marginTop: 0, marginBottom: "5px" }}>Controls</h2> */}

            <PanelSection title="Image Controls">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "auto minmax(0, 1fr)",
                        gap: "8px",
                        alignItems: "center",
                        marginBottom: "8px",
                    }}
                >
                    <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        style={{
                            border: `1px solid ${theme.control.buttonBorder}`,
                            borderRadius: "6px",
                            padding: "5px 9px",
                            background: `linear-gradient(to bottom, ${theme.control.buttonPrimaryTop} 0%, ${theme.control.buttonPrimary} 45%, ${theme.control.buttonPrimaryBottom} 100%)`,
                            color: theme.control.buttonText,
                            fontWeight: 700,
                            boxShadow: theme.control.buttonInsetHighlight,
                            cursor: "pointer",
                        }}
                    >
                        Choose File
                    </button>
                    <span
                        title={slicer.imageUrl ? slicer.imageFileName : "No file chosen"}
                        style={{
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: slicer.imageUrl
                                ? theme.panel.text
                                : theme.panel.mutedText,
                            fontSize: "13px",
                        }}
                    >
                        {slicer.imageUrl ? slicer.imageFileName : "No file chosen"}
                    </span>
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={slicer.handleFileUpload}
                        style={{ display: "none" }}
                    />
                </div>
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
                    stepInput={0.1}
                    stepSlider={0.1}
                    //                    suffix="%"
                    onChange={(value) => slicer.setImageZoom(value)}
                />

                <NumberWithSlider
                    label="Offset X"
                    value={slicer.imageOffsetX}
                    defaultValue={0}
                    min={-100}
                    max={100}
                    stepInput={0.1}
                    stepSlider={0.1}
                    onChange={(value) => slicer.setImageOffsetX(value)}
                />

                <NumberWithSlider
                    label="Offset Y"
                    value={slicer.imageOffsetY}
                    defaultValue={0}
                    min={-100}
                    max={100}
                    stepInput={0.1}
                    stepSlider={0.1}
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
                <LabeledSegmentedControl
                    label="Color"
                    value={slicer.gridColor}
                    onChange={(v) => slicer.setGridColor(v)}
                    options={[
                        { value: "black", icon: <SvgIcon name="colorBlack" size={20} />, title: "Black" },
                        { value: "gray", icon: <SvgIcon name="colorGray" size={20} />, title: "Gray" },
                        { value: "white", icon: <SvgIcon name="colorWhite" size={20} />, title: "White" },
                        { value: "red", icon: <SvgIcon name="colorRed" size={20} />, title: "Red" },
                        { value: "blue", icon: <SvgIcon name="colorBlue" size={20} />, title: "Blue" },
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
                    stepInput={0.5}
                    stepSlider={0.5}
                />
                <NumberWithSlider
                    label="Size"
                    value={slicer.gridSizeIn}
                    min={0.5}
                    max={1.5}
                    defaultValue={DEFAULT_GRID_SIZE_IN}
                    stepInput={0.01}
                    stepSlider={0.01}
                    onChange={(value) => { slicer.setGridSizeIn(value as GridSize); }}
                />
                <NumberWithSlider
                    label="Stroke"
                    value={slicer.gridLineThickness}
                    min={1}
                    max={5}
                    defaultValue={1}
                    stepSlider={0.1}
                    stepInput={0.1}
                    onChange={slicer.setGridLineThickness}
                />
                <NumberWithSlider
                    label="X Offset"
                    value={slicer.gridPhaseX}
                    min={-1}
                    max={1}
                    defaultValue={0}
                    stepSlider={0.01}
                    stepInput={0.01}
                    onChange={slicer.setGridPhaseX}
                />

                <NumberWithSlider
                    label="Y Offset"
                    value={slicer.gridPhaseY}
                    min={-1}
                    max={1}
                    defaultValue={0}
                    stepSlider={0.01}
                    stepInput={0.01}
                    onChange={slicer.setGridPhaseY}
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
                            color: slicer.imageAspectRatio
                                ? theme.control.labelText
                                : theme.control.disabledText,
                            opacity: slicer.imageAspectRatio ? 1 : 0.6,
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={slicer.maintainAspectRatio}
                            disabled={!slicer.imageAspectRatio}
                            onChange={slicer.handleAspectRatioToggle}
                            style={{
                                accentColor: theme.control.checkboxAccent,
                            }}
                        />
                        Maintain aspect ratio
                    </label>
                </div>
                <LabeledSegmentedControl
                    label="Orient"
                    value={slicer.sliceOrientation}
                    onChange={(v) => slicer.setSliceOrientation(v)}
                    options={[
                        { value: "portrait", title: "Portrait" },
                        { value: "landscape", title: "Landscape" },
                    ]}
                />
                <LabeledSegmentedControl
                    label="Slicer"
                    value={slicer.sliceSize}
                    onChange={(v) => slicer.setSliceSize(v)}
                    options={[
                        { value: "8x10", title: "8 x 10" },
                        { value: "8x10.5", title: "8 x 10.5" },
                        { value: "ledger", title: "Ledger" },
                    ]}
                />
            </PanelSection>
            <button
                type="button"
                disabled={!slicer.imageUrl || slicer.isExporting}
                onClick={slicer.handleExportPdf}
                style={{
                    width: "100%",
                    border: `1px solid ${theme.control.buttonBorder}`,
                    borderRadius: "10px",
                    padding: "12px 16px",
                    background: !slicer.imageUrl || slicer.isExporting
                        ? `linear-gradient(to bottom, ${theme.control.buttonDisabledTop} 0%, ${theme.control.buttonDisabled} 45%, ${theme.control.buttonDisabledBottom} 100%)`
                        : `linear-gradient(to bottom, ${theme.control.buttonPrimaryTop} 0%, ${theme.control.buttonPrimary} 45%, ${theme.control.buttonPrimaryBottom} 100%)`,
                    color: theme.control.buttonText,
                    fontWeight: 700,
                    boxShadow: theme.control.buttonInsetHighlight,
                    textShadow: "0 1px 0 hsl(42 85% 92% / 45%)",
                    cursor:
                        !slicer.imageUrl || slicer.isExporting ? "not-allowed" : "pointer",
                }}
            >
                {slicer.isExporting ? "Exporting PDF..." : "Export PDF"}
            </button>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                }}
            >
                <button
                    type="button"
                    disabled={!slicer.imageUrl || !slicer.imageBlob}
                    onClick={slicer.handleSaveProject}
                    style={{
                        border: `1px solid ${theme.control.buttonBorder}`,
                        borderRadius: "8px",
                        padding: "9px 10px",
                        background:
                            !slicer.imageUrl || !slicer.imageBlob
                                ? `linear-gradient(to bottom, ${theme.control.buttonDisabledTop} 0%, ${theme.control.buttonDisabled} 45%, ${theme.control.buttonDisabledBottom} 100%)`
                                : `linear-gradient(to bottom, ${theme.control.buttonPrimaryTop} 0%, ${theme.control.buttonPrimary} 45%, ${theme.control.buttonPrimaryBottom} 100%)`,
                        color: theme.control.buttonText,
                        fontWeight: 700,
                        boxShadow: theme.control.buttonInsetHighlight,
                        cursor:
                            !slicer.imageUrl || !slicer.imageBlob
                                ? "not-allowed"
                                : "pointer",
                    }}
                >
                    Save Project
                </button>

                <button
                    type="button"
                    onClick={() => projectOpenInputRef.current?.click()}
                    style={{
                        border: `1px solid ${theme.control.buttonBorder}`,
                        borderRadius: "8px",
                        padding: "9px 10px",
                        background: `linear-gradient(to bottom, ${theme.control.buttonPrimaryTop} 0%, ${theme.control.buttonPrimary} 45%, ${theme.control.buttonPrimaryBottom} 100%)`,
                        color: theme.control.buttonText,
                        fontWeight: 700,
                        boxShadow: theme.control.buttonInsetHighlight,
                        cursor: "pointer",
                    }}
                >
                    Open Project
                </button>
                <input
                    ref={projectOpenInputRef}
                    type="file"
                    accept=".wmsts,application/zip,application/vnd.trumpoot.wmsts+zip"
                    onChange={slicer.handleOpenProject}
                    style={{ display: "none" }}
                />
            </div>

            {slicer.exportMessage && (
                <div
                    style={{
                        marginTop: "12px",
                        color: theme.panel.mutedText,
                        fontSize: "14px",
                    }}
                >
                    {slicer.exportMessage}
                </div>
            )}
        </aside>
    );
}

export default ControlPanel;
