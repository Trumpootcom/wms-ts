import type {
    GridColor,
    GridMode,
    GridSize,
    ImageAdjustments,
    SliceEstimate,
    SliceSize,
} from "../slicer/types.ts";
import { formatInches, formatPercent } from "../utils/format.ts";

type SourceSizeReport = {
    sourceWidthIn: number;
    sourceHeightIn: number;
    stretchX: number;
    stretchY: number;
};

type PreviewPanelProps = {
    imageUrl: string | null;
    printedWidthIn: number;
    printedHeightIn: number;
    gridMode: GridMode;
    gridColor: GridColor;
    gridSizeIn: GridSize;
    sliceSize: SliceSize;
    sliceEstimate: SliceEstimate;
    previewStage: {
        width: number;
        height: number;
    };
    sourceSizeReport: SourceSizeReport | null;
    sourcePixelWidth: number | null;
    sourcePixelHeight: number | null;
    exportDpi: number;
    imageAdjustments: ImageAdjustments;
};

function PreviewPanel({
    imageUrl,
    printedWidthIn,
    printedHeightIn,
    gridMode,
    gridColor,
    gridSizeIn,
    sliceSize,
    sliceEstimate,
    previewStage,
    sourceSizeReport,
    sourcePixelWidth,
    sourcePixelHeight,
    exportDpi,
    imageAdjustments,
}: PreviewPanelProps) {
    const infoPaneHeight = 132;

    const previewGridLineColor =
        gridColor === "black" ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)";

    const sliceLineColor =
        gridColor === "black" ? "rgba(220, 38, 38, 0.95)" : "rgba(239, 68, 68, 0.95)";

    const mapWidthFt = (printedWidthIn / gridSizeIn) * 5;
    const mapHeightFt = (printedHeightIn / gridSizeIn) * 5;

    const gridModeLabel = gridMode.charAt(0).toUpperCase() + gridMode.slice(1);
    const sliceSizeLabel = sliceSize === "8x10" ? "8 × 10" : "8 × 10.5";

    const imageFilter = `
        brightness(${imageAdjustments.brightness}%)
        contrast(${imageAdjustments.contrast}%)
        saturate(${imageAdjustments.saturation}%)
    `;

    const stageAspect = printedWidthIn / printedHeightIn;

    const stageWidth = Math.max(previewStage.width, 1);
    const stageHeight = Math.max(previewStage.height, 1);

    let frameWidthPx = stageWidth;
    let frameHeightPx = frameWidthPx / stageAspect;

    if (frameHeightPx > stageHeight) {
        frameHeightPx = stageHeight;
        frameWidthPx = frameHeightPx * stageAspect;
    }

    const imageAspect =
        sourcePixelWidth && sourcePixelHeight
            ? sourcePixelWidth / sourcePixelHeight
            : stageAspect;

    let imageBoxWidthPx = frameWidthPx;
    let imageBoxHeightPx = imageBoxWidthPx / imageAspect;

    if (imageBoxHeightPx > frameHeightPx) {
        imageBoxHeightPx = frameHeightPx;
        imageBoxWidthPx = imageBoxHeightPx * imageAspect;
    }

    const imageBoxLeftPx = (frameWidthPx - imageBoxWidthPx) / 2;
    const imageBoxTopPx = (frameHeightPx - imageBoxHeightPx) / 2;

    return (
        <section
            style={{
                background: "#f3f4f6",
                height: "100%",
                minHeight: 0,
                boxSizing: "border-box",
                display: "grid",
                gridTemplateRows: `auto minmax(0, 1fr) 1px ${infoPaneHeight}px`,
                overflow: "hidden",
            }}
        >
            <h2
                style={{
                    margin: "12px",
                }}
            >
                Preview
            </h2>

            <div
                style={{
                    minHeight: 0,
                    overflow: "hidden",
                    padding: "12px",
                    boxSizing: "border-box",
                    display: "grid",
                    placeItems: "center",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        minWidth: 0,
                        minHeight: 0,
                        display: "grid",
                        placeItems: "center",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            width: `${frameWidthPx}px`,
                            height: `${frameHeightPx}px`,
                            position: "relative",
                            border: "1px solid #9ca3af",
                            background: "#e5e7eb",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                            overflow: "hidden",
                            flexShrink: 0,
                        }}
                    >
                        {imageUrl ? (
                            <div
                                style={{
                                    position: "absolute",
                                    left: `${imageBoxLeftPx}px`,
                                    top: `${imageBoxTopPx}px`,
                                    width: `${imageBoxWidthPx}px`,
                                    height: `${imageBoxHeightPx}px`,
                                    overflow: "hidden",
                                }}
                            >
                                <img
                                    src={imageUrl}
                                    alt="Uploaded map preview"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "fill",
                                        display: "block",
                                        filter: imageFilter,
                                    }}
                                />

                                {gridMode !== "none" && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            pointerEvents: "none",
                                            backgroundImage: `
                                                linear-gradient(to right, ${previewGridLineColor} 1px, transparent 1px),
                                                linear-gradient(to bottom, ${previewGridLineColor} 1px, transparent 1px)
                                            `,
                                            backgroundSize: `${(gridSizeIn / printedWidthIn) * 100}% ${(gridSizeIn / printedHeightIn) * 100}%`,
                                            backgroundPosition: "0 0, 0 0",
                                        }}
                                    />
                                )}

                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        pointerEvents: "none",
                                        boxSizing: "border-box",
                                        border: `2px solid ${sliceLineColor}`,
                                        backgroundImage: `
                                            linear-gradient(to right, ${sliceLineColor} 2px, transparent 2px),
                                            linear-gradient(to bottom, ${sliceLineColor} 2px, transparent 2px)
                                        `,
                                        backgroundSize: `${(8 / printedWidthIn) * 100}% ${((sliceSize === "8x10" ? 10 : 10.5) / printedHeightIn) * 100}%`,
                                        backgroundPosition: "0 0, 0 0",
                                        backgroundRepeat: "repeat",
                                    }}
                                />
                            </div>
                        ) : (
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#4b5563",
                                    fontSize: "18px",
                                    background:
                                        "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(0,0,0,0.04))",
                                }}
                            >
                                No image loaded
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div
                style={{
                    background: "#d1d5db",
                }}
            />

            <div
                style={{
                    overflow: "hidden",
                    color: "#4b5563",
                    lineHeight: 1.5,
                    fontSize: "14px",
                    background: "#e5e7eb",
                    padding: "10px",
                    boxSizing: "border-box",
                }}
            >
                {sourcePixelWidth && sourcePixelHeight && (
                    <div>
                        Source pixels: {sourcePixelWidth} × {sourcePixelHeight}
                    </div>
                )}

                {sourceSizeReport ? (
                    <>
                        <div>
                            Source crop fit: {formatInches(sourceSizeReport.sourceWidthIn)}" ×{" "}
                            {formatInches(sourceSizeReport.sourceHeightIn)}"
                        </div>
                        <div>
                            Printed target: {formatInches(printedWidthIn)}" ×{" "}
                            {formatInches(printedHeightIn)}"
                        </div>
                        <div>
                            Stretch: {formatPercent(sourceSizeReport.stretchX)}% horizontal,{" "}
                            {formatPercent(sourceSizeReport.stretchY)}% vertical
                        </div>
                    </>
                ) : (
                    <div>
                        Printed target: {formatInches(printedWidthIn)}" ×{" "}
                        {formatInches(printedHeightIn)}"
                    </div>
                )}

                <div>
                    Grid: {gridModeLabel}, {gridColor}, {gridSizeIn}" squares
                </div>
                <div>
                    Slice layout: {sliceEstimate.cols} × {sliceEstimate.rows} ={" "}
                    {sliceEstimate.total} page{sliceEstimate.total === 1 ? "" : "s"}
                </div>
                <div>Slice format: {sliceSizeLabel}</div>
                <div>Export DPI: {exportDpi}</div>
                <div>
                    Map size: {formatInches(mapWidthFt)} ft × {formatInches(mapHeightFt)} ft
                </div>
            </div>
        </section>
    );
}

export default PreviewPanel;