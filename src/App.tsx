import { useMemo, useState } from "react";

const MIN_SIZE_IN = 8;
const MAX_SIZE_IN = 36;
const DEFAULT_WIDTH_IN = 30;
const DEFAULT_HEIGHT_IN = 20;
const TILE_WIDTH_IN = 8;
const TILE_HEIGHT_IN = 10;
const PREVIEW_MAX_WIDTH_PX = 900;
const PREVIEW_MAX_HEIGHT_PX = 620;

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

type GridColor = "black" | "white";

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  const [printedWidthIn, setPrintedWidthIn] = useState<number>(DEFAULT_WIDTH_IN);
  const [printedHeightIn, setPrintedHeightIn] = useState<number>(DEFAULT_HEIGHT_IN);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(false);

  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [gridColor, setGridColor] = useState<GridColor>("black");

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

  const pageEstimate = useMemo(() => {
    const cols = Math.ceil(printedWidthIn / TILE_WIDTH_IN);
    const rows = Math.ceil(printedHeightIn / TILE_HEIGHT_IN);
    return {
      cols,
      rows,
      total: cols * rows,
    };
  }, [printedWidthIn, printedHeightIn]);

  const previewGridLineColor =
    gridColor === "black" ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)";

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

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
              />
              Show grid
            </label>

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
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              padding: "12px",
              background: "#f9fafb",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "8px" }}>Page Estimate</div>
            <div>
              Estimated tiles: {pageEstimate.cols} × {pageEstimate.rows}
            </div>
            <div>Estimated pages: {pageEstimate.total}</div>
          </div>
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

              {showGrid && (
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
            </div>
          </div>

          <div style={{ marginTop: "16px", color: "#4b5563" }}>
            Printed size: {printedWidthIn}" × {printedHeightIn}"
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;