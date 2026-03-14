import { jsPDF } from "jspdf";
import { useMemo, useState } from "react";

const MIN_SIZE_IN = 8;
const MAX_SIZE_IN = 36;
const DEFAULT_WIDTH_IN = 30;
const DEFAULT_HEIGHT_IN = 20;
const PREVIEW_MAX_WIDTH_PX = 900;
const PREVIEW_MAX_HEIGHT_PX = 620;
const EXPORT_DPI = 150;

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function rowLabelFromIndex(index: number): string {
  let n = index + 1;
  let label = "";

  while (n > 0) {
    const rem = (n - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    n = Math.floor((n - 1) / 26);
  }

  return label;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for export."));
    img.src = src;
  });
}

function getPageMargins(sliceSize: SliceSize): { left: number; top: number } {
  if (sliceSize === "8x10.5") {
    return { left: 0.25, top: 0.25 };
  }
  return { left: 0.25, top: 0.5 };
}

function drawLineGrid(
  ctx: CanvasRenderingContext2D,
  tileWidthPx: number,
  tileHeightPx: number,
  tileXIn: number,
  tileYIn: number,
  tileWidthIn: number,
  tileHeightIn: number,
  dpi: number,
  strokeStyle: string,
) {
  ctx.save();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 1;

  const startVertical = Math.ceil(tileXIn);
  const endVertical = Math.floor(tileXIn + tileWidthIn);

  for (let inch = startVertical; inch <= endVertical; inch++) {
    const x = (inch - tileXIn) * dpi;
    if (x < 0 || x > tileWidthPx) continue;
    const crispX = Math.round(x) + 0.5;
    ctx.beginPath();
    ctx.moveTo(crispX, 0);
    ctx.lineTo(crispX, tileHeightPx);
    ctx.stroke();
  }

  const startHorizontal = Math.ceil(tileYIn);
  const endHorizontal = Math.floor(tileYIn + tileHeightIn);

  for (let inch = startHorizontal; inch <= endHorizontal; inch++) {
    const y = (inch - tileYIn) * dpi;
    if (y < 0 || y > tileHeightPx) continue;
    const crispY = Math.round(y) + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, crispY);
    ctx.lineTo(tileWidthPx, crispY);
    ctx.stroke();
  }

  ctx.restore();
}

type GridColor = "black" | "white";
type GridMode = "none" | "line";
type SliceSize = "8x10" | "8x10.5";

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  const [printedWidthIn, setPrintedWidthIn] = useState<number>(DEFAULT_WIDTH_IN);
  const [printedHeightIn, setPrintedHeightIn] = useState<number>(DEFAULT_HEIGHT_IN);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(false);

  const [gridMode, setGridMode] = useState<GridMode>("line");
  const [gridColor, setGridColor] = useState<GridColor>("black");
  const [sliceSize, setSliceSize] = useState<SliceSize>("8x10");

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>("");

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    const img = new Image();
    img.onload = () => {
      if (!img.width || !img.height) return;

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

  const tileConfig = useMemo(() => {
    if (sliceSize === "8x10.5") {
      return { widthIn: 8, heightIn: 10.5 };
    }
    return { widthIn: 8, heightIn: 10 };
  }, [sliceSize]);

  const sliceEstimate = useMemo(() => {
    const cols = Math.ceil(printedWidthIn / tileConfig.widthIn);
    const rows = Math.ceil(printedHeightIn / tileConfig.heightIn);

    const tiles: Array<{
      row: number;
      col: number;
      xIn: number;
      yIn: number;
      widthIn: number;
      heightIn: number;
      label: string;
    }> = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const xIn = col * tileConfig.widthIn;
        const yIn = row * tileConfig.heightIn;

        const widthIn =
          col === cols - 1
            ? roundToTenth(printedWidthIn - col * tileConfig.widthIn)
            : tileConfig.widthIn;

        const heightIn =
          row === rows - 1
            ? roundToTenth(printedHeightIn - row * tileConfig.heightIn)
            : tileConfig.heightIn;

        tiles.push({
          row,
          col,
          xIn,
          yIn,
          widthIn,
          heightIn,
          label: `${rowLabelFromIndex(row)}${col + 1}`,
        });
      }
    }

    return {
      cols,
      rows,
      total: cols * rows,
      tiles,
    };
  }, [printedWidthIn, printedHeightIn, tileConfig]);

  const previewGridLineColor =
    gridColor === "black" ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)";

  const exportGridLineColor = gridColor === "black" ? "#000000" : "#ffffff";

  const sliceLineColor =
    gridColor === "black" ? "rgba(220, 38, 38, 0.95)" : "rgba(239, 68, 68, 0.95)";

  const labelBgColor =
    gridColor === "black" ? "rgba(255,255,255,0.88)" : "rgba(17,24,39,0.82)";

  const labelTextColor = gridColor === "black" ? "#111827" : "#ffffff";

  const previewStage = useMemo(() => {
    const aspect = printedWidthIn / printedHeightIn;

    let width = PREVIEW_MAX_WIDTH_PX;
    let height = width / aspect;

    if (height > PREVIEW_MAX_HEIGHT_PX) {
      height = PREVIEW_MAX_HEIGHT_PX;
      width = height * aspect;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }, [printedWidthIn, printedHeightIn]);

  async function handleExportPdf() {
    if (!imageUrl) {
      setExportMessage("Please upload an image first.");
      return;
    }

    setIsExporting(true);
    setExportMessage("Preparing PDF...");

    try {
      const sourceImage = await loadImage(imageUrl);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "letter",
        compress: true,
      });

      const margins = getPageMargins(sliceSize);

      for (let i = 0; i < sliceEstimate.tiles.length; i++) {
        const tile = sliceEstimate.tiles[i];

        setExportMessage(
          `Rendering page ${i + 1} of ${sliceEstimate.tiles.length} (${tile.label})...`,
        );

        if (i > 0) {
          pdf.addPage("letter", "portrait");
        }

        const tileWidthPx = Math.max(1, Math.round(tile.widthIn * EXPORT_DPI));
        const tileHeightPx = Math.max(1, Math.round(tile.heightIn * EXPORT_DPI));

        const canvas = document.createElement("canvas");
        canvas.width = tileWidthPx;
        canvas.height = tileHeightPx;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not create export canvas.");
        }

        const sx = (tile.xIn / printedWidthIn) * sourceImage.width;
        const sy = (tile.yIn / printedHeightIn) * sourceImage.height;
        const sw = (tile.widthIn / printedWidthIn) * sourceImage.width;
        const sh = (tile.heightIn / printedHeightIn) * sourceImage.height;

        ctx.drawImage(
          sourceImage,
          sx,
          sy,
          sw,
          sh,
          0,
          0,
          tileWidthPx,
          tileHeightPx,
        );

        if (gridMode === "line") {
          drawLineGrid(
            ctx,
            tileWidthPx,
            tileHeightPx,
            tile.xIn,
            tile.yIn,
            tile.widthIn,
            tile.heightIn,
            EXPORT_DPI,
            exportGridLineColor,
          );
        }

        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);

        pdf.addImage(
          imageDataUrl,
          "JPEG",
          margins.left,
          margins.top,
          tile.widthIn,
          tile.heightIn,
          undefined,
          "FAST",
        );

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(tile.label, 4.25, 10.88, { align: "center" });
      }

      const safeWidth = String(printedWidthIn).replace(".", "_");
      const safeHeight = String(printedHeightIn).replace(".", "_");
      pdf.save(`vtt_slices_${safeWidth}x${safeHeight}.pdf`);
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
                    backgroundSize: `${100 / printedWidthIn}% ${100 / printedHeightIn}%`,
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

          <div style={{ marginTop: "16px", color: "#4b5563" }}>
            Printed size: {printedWidthIn}" × {printedHeightIn}"
          </div>
          <div style={{ marginTop: "6px", color: "#4b5563" }}>
            Slice mode: {sliceSize === "8x10" ? "8 × 10" : "8 × 10.5"}
          </div>
          <div style={{ marginTop: "6px", color: "#4b5563" }}>
            Export DPI: {EXPORT_DPI}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;