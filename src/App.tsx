import { useMemo, useState } from "react";
import { buildSliceEstimate, clamp, getPreviewStageSize, roundToTenth } from "./slicer/math";
import { exportSlicedPdf } from "./slicer/pdf";
import type { GridColor, GridMode, GridSize, SliceSize } from "./slicer/types";
import { formatInches, formatPercent } from "./utils/format";

const MIN_SIZE_IN = 8;
const MAX_SIZE_IN = 36;
const DEFAULT_WIDTH_IN = 30;
const DEFAULT_HEIGHT_IN = 20;
const PREVIEW_MAX_WIDTH_PX = 900;
const PREVIEW_MAX_HEIGHT_PX = 620;
const EXPORT_DPI = 150;

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [sourcePixelWidth, setSourcePixelWidth] = useState<number | null>(null);
  const [sourcePixelHeight, setSourcePixelHeight] = useState<number | null>(null);

  const [printedWidthIn, setPrintedWidthIn] = useState<number>(DEFAULT_WIDTH_IN);
  const [printedHeightIn, setPrintedHeightIn] = useState<number>(DEFAULT_HEIGHT_IN);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(false);

  const [gridMode, setGridMode] = useState<GridMode>("line");
  const [gridColor, setGridColor] = useState<GridColor>("black");
  const [sliceSize, setSliceSize] = useState<SliceSize>("8x10");
  const [gridSizeIn, setGridSizeIn] = useState<GridSize>(1);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>("");

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    const img = new Image();
    img.onload = () => {
      if (!img.width || !img.height) return;

      setSourcePixelWidth(img.width);
      setSourcePixelHeight(img.height);

      const aspect = img.width / img.height;
      setImageAspectRatio(aspect);
      setImageUrl(url);

      if (maintainAspectRatio) {
        const adjustedHeight = clamp(
          roundToTenth(printedWidthIn / aspect),
          MIN_SIZE_IN,
          MAX_SIZE_IN,
        );
        const adjustedWidth = clamp(
          roundToTenth(adjustedHeight * aspect),
          MIN_SIZE_IN,
          MAX_SIZE_IN,
        );

        setPrintedHeightIn(adjustedHeight);
        setPrintedWidthIn(adjustedWidth);
      }
    };
    img.src = url;
  }

  function updateWidth(nextWidthRaw: number) {
    const nextWidth = clamp(roundToTenth(nextWidthRaw), MIN_SIZE_IN, MAX_SIZE_IN);

    if (maintainAspectRatio && imageAspectRatio) {
      let nextHeight = roundToTenth(nextWidth / imageAspectRatio);
      nextHeight = clamp(nextHeight, MIN_SIZE_IN, MAX_SIZE_IN);

      const adjustedWidth = clamp(
        roundToTenth(nextHeight * imageAspectRatio),
        MIN_SIZE_IN,
        MAX_SIZE_IN,
      );

      setPrintedWidthIn(adjustedWidth);
      setPrintedHeightIn(nextHeight);
      return;
    }

    setPrintedWidthIn(nextWidth);
  }

  function updateHeight(nextHeightRaw: number) {
    const nextHeight = clamp(roundToTenth(nextHeightRaw), MIN_SIZE_IN, MAX_SIZE_IN);

    if (maintainAspectRatio && imageAspectRatio) {
      let nextWidth = roundToTenth(nextHeight * imageAspectRatio);
      nextWidth = clamp(nextWidth, MIN_SIZE_IN, MAX_SIZE_IN);

      const adjustedHeight = clamp(
        roundToTenth(nextWidth / imageAspectRatio),
        MIN_SIZE_IN,
        MAX_SIZE_IN,
      );

      setPrintedWidthIn(nextWidth);
      setPrintedHeightIn(adjustedHeight);
      return;
    }

    setPrintedHeightIn(nextHeight);
  }

  function handleAspectRatioToggle(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    setMaintainAspectRatio(checked);

    if (checked && imageAspectRatio) {
      let nextHeight = roundToTenth(printedWidthIn / imageAspectRatio);
      nextHeight = clamp(nextHeight, MIN_SIZE_IN, MAX_SIZE_IN);

      const adjustedWidth = clamp(
        roundToTenth(nextHeight * imageAspectRatio),
        MIN_SIZE_IN,
        MAX_SIZE_IN,
      );

      setPrintedHeightIn(nextHeight);
      setPrintedWidthIn(adjustedWidth);
    }
  }

  const sliceEstimate = useMemo(
    () => buildSliceEstimate(printedWidthIn, printedHeightIn, sliceSize),
    [printedWidthIn, printedHeightIn, sliceSize],
  );

  const previewGridLineColor =
    gridColor === "black" ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)";

  const sliceLineColor =
    gridColor === "black" ? "rgba(220, 38, 38, 0.95)" : "rgba(239, 68, 68, 0.95)";

  const labelBgColor =
    gridColor === "black" ? "rgba(255,255,255,0.88)" : "rgba(17,24,39,0.82)";

  const labelTextColor = gridColor === "black" ? "#111827" : "#ffffff";

  const previewStage = useMemo(
    () =>
      getPreviewStageSize(
        printedWidthIn,
        printedHeightIn,
        PREVIEW_MAX_WIDTH_PX,
        PREVIEW_MAX_HEIGHT_PX,
      ),
    [printedWidthIn, printedHeightIn],
  );

  const sourceSizeReport = useMemo(() => {
    if (!imageAspectRatio) return null;

    const printedAspect = printedWidthIn / printedHeightIn;

    let sourceWidthIn: number;
    let sourceHeightIn: number;

    if (imageAspectRatio >= printedAspect) {
      sourceHeightIn = printedHeightIn;
      sourceWidthIn = printedHeightIn * imageAspectRatio;
    } else {
      sourceWidthIn = printedWidthIn;
      sourceHeightIn = printedWidthIn / imageAspectRatio;
    }

    const stretchX = (printedWidthIn / sourceWidthIn) * 100;
    const stretchY = (printedHeightIn / sourceHeightIn) * 100;

    return {
      sourceWidthIn,
      sourceHeightIn,
      stretchX,
      stretchY,
    };
  }, [imageAspectRatio, printedWidthIn, printedHeightIn]);

  async function handleExportPdf() {
    if (!imageUrl) {
      setExportMessage("Please upload an image first.");
      return;
    }

    setIsExporting(true);
    setExportMessage("Preparing PDF...");

    try {
      await exportSlicedPdf({
        imageUrl,
        printedWidthIn,
        printedHeightIn,
        sliceSize,
        sliceEstimate,
        gridMode,
        gridColor,
        gridSizeIn,
        exportDpi: EXPORT_DPI,
        onProgress: setExportMessage,
      });

      setExportMessage("PDF downloaded.");
    } catch (error) {
      console.error(error);
      setExportMessage("Export failed.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        color: "#111827",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          background: "#1f2937",
          color: "white",
          padding: "16px 24px",
        }}
      >
        <h1 style={{ margin: 0 }}>VTT Slicer</h1>
      </header>

      <main
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: "16px",
          padding: "16px",
        }}
      >
        <aside
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Controls</h2>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>
              Upload Map
            </label>
            <input type="file" accept="image/*" onChange={handleFileUpload} />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>
              Printed Width (in)
            </label>
            <input
              type="number"
              min={MIN_SIZE_IN}
              max={MAX_SIZE_IN}
              step={0.1}
              value={printedWidthIn}
              onChange={(e) => updateWidth(Number(e.target.value))}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px",
                marginBottom: "8px",
              }}
            />
            <input
              type="range"
              min={MIN_SIZE_IN}
              max={MAX_SIZE_IN}
              step={0.5}
              value={printedWidthIn}
              onChange={(e) => updateWidth(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>
              Printed Height (in)
            </label>
            <input
              type="number"
              min={MIN_SIZE_IN}
              max={MAX_SIZE_IN}
              step={0.1}
              value={printedHeightIn}
              onChange={(e) => updateHeight(Number(e.target.value))}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px",
                marginBottom: "8px",
              }}
            />
            <input
              type="range"
              min={MIN_SIZE_IN}
              max={MAX_SIZE_IN}
              step={0.5}
              value={printedHeightIn}
              onChange={(e) => updateHeight(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: imageAspectRatio ? 1 : 0.6,
              }}
            >
              <input
                type="checkbox"
                checked={maintainAspectRatio}
                disabled={!imageAspectRatio}
                onChange={handleAspectRatioToggle}
              />
              Maintain aspect ratio
            </label>
          </div>

          <div
            style={{
              marginBottom: "20px",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              padding: "12px",
              background: "#f9fafb",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "10px" }}>Grid</div>

            <div
              style={{
                display: "inline-flex",
                background: "#e5e7eb",
                borderRadius: "999px",
                padding: "4px",
                gap: "4px",
                marginBottom: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => setGridMode("none")}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  background: gridMode === "none" ? "#111827" : "transparent",
                  color: gridMode === "none" ? "white" : "#111827",
                  fontWeight: 700,
                }}
              >
                None
              </button>

              <button
                type="button"
                onClick={() => setGridMode("line")}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  background: gridMode === "line" ? "#111827" : "transparent",
                  color: gridMode === "line" ? "white" : "#111827",
                  fontWeight: 700,
                }}
              >
                Line
              </button>
            </div>

            <div style={{ marginBottom: "8px", fontWeight: 700 }}>Grid Color</div>

            <div
              style={{
                display: "inline-flex",
                background: "#e5e7eb",
                borderRadius: "999px",
                padding: "4px",
                gap: "4px",
                marginBottom: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => setGridColor("black")}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  background: gridColor === "black" ? "#111827" : "transparent",
                  color: gridColor === "black" ? "white" : "#111827",
                  fontWeight: 700,
                }}
              >
                Black
              </button>

              <button
                type="button"
                onClick={() => setGridColor("white")}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  background: gridColor === "white" ? "white" : "transparent",
                  color: "#111827",
                  fontWeight: 700,
                  boxShadow:
                    gridColor === "white" ? "0 0 0 1px rgba(0,0,0,0.12) inset" : "none",
                }}
              >
                White
              </button>
            </div>

            <div style={{ marginBottom: "8px", fontWeight: 700 }}>Grid Size (in)</div>

            <div
              style={{
                display: "inline-flex",
                background: "#e5e7eb",
                borderRadius: "999px",
                padding: "4px",
                gap: "4px",
                flexWrap: "wrap",
              }}
            >
              {[0.75, 1, 1.25, 1.5].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setGridSizeIn(size as GridSize)}
                  style={{
                    border: "none",
                    borderRadius: "999px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    background: gridSizeIn === size ? "#111827" : "transparent",
                    color: gridSizeIn === size ? "white" : "#111827",
                    fontWeight: 700,
                  }}
                >
                  {size}"
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              marginBottom: "20px",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              padding: "12px",
              background: "#f9fafb",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "10px" }}>Slice Size</div>

            <div
              style={{
                display: "inline-flex",
                background: "#e5e7eb",
                borderRadius: "999px",
                padding: "4px",
                gap: "4px",
              }}
            >
              <button
                type="button"
                onClick={() => setSliceSize("8x10")}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  background: sliceSize === "8x10" ? "#111827" : "transparent",
                  color: sliceSize === "8x10" ? "white" : "#111827",
                  fontWeight: 700,
                }}
              >
                8 × 10
              </button>

              <button
                type="button"
                onClick={() => setSliceSize("8x10.5")}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  background: sliceSize === "8x10.5" ? "#111827" : "transparent",
                  color: sliceSize === "8x10.5" ? "white" : "#111827",
                  fontWeight: 700,
                }}
              >
                8 × 10.5
              </button>
            </div>
          </div>

          <div
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              padding: "12px",
              background: "#f9fafb",
              marginBottom: "20px",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "8px" }}>Page Estimate</div>
            <div>
              Estimated tiles: {sliceEstimate.cols} × {sliceEstimate.rows}
            </div>
            <div>Estimated pages: {sliceEstimate.total}</div>
          </div>

          <button
            type="button"
            disabled={!imageUrl || isExporting}
            onClick={handleExportPdf}
            style={{
              width: "100%",
              border: "none",
              borderRadius: "10px",
              padding: "12px 16px",
              background: !imageUrl || isExporting ? "#9ca3af" : "#2563eb",
              color: "white",
              fontWeight: 700,
              cursor: !imageUrl || isExporting ? "not-allowed" : "pointer",
            }}
          >
            {isExporting ? "Exporting PDF..." : "Export PDF"}
          </button>

          {exportMessage && (
            <div style={{ marginTop: "12px", color: "#4b5563", fontSize: "14px" }}>
              {exportMessage}
            </div>
          )}
        </aside>

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

              {gridMode === "line" && (
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
            <div>Export DPI: {EXPORT_DPI}</div>
            <div>Grid size: {gridSizeIn}"</div>
            {sourcePixelWidth && sourcePixelHeight && (
              <div>
                Source pixels: {sourcePixelWidth} × {sourcePixelHeight}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;