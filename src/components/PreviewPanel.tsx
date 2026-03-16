import type { GridColor, GridMode, GridSize, SliceEstimate, SliceSize } from "../slicer/types.ts";
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
}: PreviewPanelProps) {
    const previewGridLineColor =
        gridColor === "black" ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)";

    const sliceLineColor =
        gridColor === "black" ? "rgba(220, 38, 38, 0.95)" : "rgba(239, 68, 68, 0.95)";

    const labelBgColor =
        gridColor === "black" ? "rgba(255,255,255,0.88)" : "rgba(17,24,39,0.82)";

    const labelTextColor = gridColor === "black" ? "#111827" : "#ffffff";

    const mapWidthFt = (printedWidthIn / gridSizeIn) * 5;
    const mapHeightFt = (printedHeightIn / gridSizeIn) * 5;

    return (
        <section
            style={{
                background: "white",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                minHeight: "500px",
            }}
        >
            <h2 style={{ marginTop: 0 }}>Preview</h2>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    width: "100%",
                    overflow: "auto",
                }}
            >
                <div
                    style={{
                        width: `${previewStage.width}px`,
                        height: `${previewStage.height}px`,
                        position: "relative",
                        border: "1px solid #9ca3af",
                        background: "#e5e7eb",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        overflow: "hidden",
                    }}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt="Uploaded map preview"
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "fill",
                                display: "block",
                            }}
                        />
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
                                backgroundSize: `${(gridSizeIn * 100) / printedWidthIn}% ${(gridSizeIn * 100) / printedHeightIn}%`,
                            }}
                        />
                    )}

                    {sliceEstimate.tiles.map((tile) => {
                        const leftPct = (tile.xIn / printedWidthIn) * 100;
                        const topPct = (tile.yIn / printedHeightIn) * 100;
                        const widthPct = (tile.widthIn / printedWidthIn) * 100;
                        const heightPct = (tile.heightIn / printedHeightIn) * 100;

                        return (
                            <div
                                key={tile.label}
                                style={{
                                    position: "absolute",
                                    left: `${leftPct}%`,
                                    top: `${topPct}%`,
                                    width: `${widthPct}%`,
                                    height: `${heightPct}%`,
                                    border: `2px solid ${sliceLineColor}`,
                                    boxSizing: "border-box",
                                    pointerEvents: "none",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "6px",
                                        left: "6px",
                                        padding: "2px 6px",
                                        borderRadius: "999px",
                                        background: labelBgColor,
                                        color: labelTextColor,
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        lineHeight: 1.2,
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
                                    }}
                                >
                                    {tile.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>


            <div style={{ marginTop: "16px", color: "#4b5563", lineHeight: 1.5 }}>
                {sourcePixelWidth && sourcePixelHeight && (
                    <div>
                        Source pixels: {sourcePixelWidth} × {sourcePixelHeight}
                    </div>
                )}

                {sourceSizeReport ? (
                    <>
                        <div>
                            Source size: {formatInches(sourceSizeReport.sourceWidthIn)}" ×{" "}
                            {formatInches(sourceSizeReport.sourceHeightIn)}"
                        </div>
                        <div>
                            Printed size: {formatInches(printedWidthIn)}" ×{" "}
                            {formatInches(printedHeightIn)}" (
                            {formatPercent(sourceSizeReport.stretchX)}% ×{" "}
                            {formatPercent(sourceSizeReport.stretchY)}%)
                        </div>
                    </>
                ) : (
                    <div>
                        Printed size: {formatInches(printedWidthIn)}" ×{" "}
                        {formatInches(printedHeightIn)}"
                    </div>
                )}

                <div>Slice mode: {sliceSize === "8x10" ? "8 × 10" : "8 × 10.5"}</div>
                <div>Export DPI: {exportDpi}</div>
                <div>Grid size: {gridSizeIn}"</div>
                <div>
                    Map Size: {formatInches(mapWidthFt)} ft × {formatInches(mapHeightFt)} ft
                </div>
            </div>
        </section>
    );
}

export default PreviewPanel;