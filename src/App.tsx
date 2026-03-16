import PreviewPanel from "./components/PreviewPanel.tsx";
import { useSlicerState } from "./hooks/useSlicerState.ts";

function App() {
  const slicer = useSlicerState();

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
            <input type="file" accept="image/*" onChange={slicer.handleFileUpload} />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>
              Printed Width (in)
            </label>
            <input
              type="number"
              min={8}
              max={36}
              step={0.1}
              value={slicer.printedWidthIn}
              onChange={(e) => slicer.updateWidth(Number(e.target.value))}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px",
                marginBottom: "8px",
              }}
            />
            <input
              type="range"
              min={8}
              max={36}
              step={0.5}
              value={slicer.printedWidthIn}
              onChange={(e) => slicer.updateWidth(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>
              Printed Height (in)
            </label>
            <input
              type="number"
              min={8}
              max={36}
              step={0.1}
              value={slicer.printedHeightIn}
              onChange={(e) => slicer.updateHeight(Number(e.target.value))}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px",
                marginBottom: "8px",
              }}
            />
            <input
              type="range"
              min={8}
              max={36}
              step={0.5}
              value={slicer.printedHeightIn}
              onChange={(e) => slicer.updateHeight(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

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
              {["none", "line", "dash", "corner"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => slicer.setGridMode(mode as typeof slicer.gridMode)}
                  style={{
                    border: "none",
                    borderRadius: "999px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    background: slicer.gridMode === mode ? "#111827" : "transparent",
                    color: slicer.gridMode === mode ? "white" : "#111827",
                    fontWeight: 700,
                  }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
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
                onClick={() => slicer.setGridColor("black")}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  background: slicer.gridColor === "black" ? "#111827" : "transparent",
                  color: slicer.gridColor === "black" ? "white" : "#111827",
                  fontWeight: 700,
                }}
              >
                Black
              </button>

              <button
                type="button"
                onClick={() => slicer.setGridColor("white")}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  background: slicer.gridColor === "white" ? "white" : "transparent",
                  color: "#111827",
                  fontWeight: 700,
                  boxShadow:
                    slicer.gridColor === "white"
                      ? "0 0 0 1px rgba(0,0,0,0.12) inset"
                      : "none",
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
                  onClick={() => slicer.setGridSizeIn(size as typeof slicer.gridSizeIn)}
                  style={{
                    border: "none",
                    borderRadius: "999px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    background: slicer.gridSizeIn === size ? "#111827" : "transparent",
                    color: slicer.gridSizeIn === size ? "white" : "#111827",
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
                onClick={() => slicer.setSliceSize("8x10")}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  background: slicer.sliceSize === "8x10" ? "#111827" : "transparent",
                  color: slicer.sliceSize === "8x10" ? "white" : "#111827",
                  fontWeight: 700,
                }}
              >
                8 × 10
              </button>

              <button
                type="button"
                onClick={() => slicer.setSliceSize("8x10.5")}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  background: slicer.sliceSize === "8x10.5" ? "#111827" : "transparent",
                  color: slicer.sliceSize === "8x10.5" ? "white" : "#111827",
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
              Estimated tiles: {slicer.sliceEstimate.cols} × {slicer.sliceEstimate.rows}
            </div>
            <div>Estimated pages: {slicer.sliceEstimate.total}</div>
          </div>

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

        <PreviewPanel
          imageUrl={slicer.imageUrl}
          printedWidthIn={slicer.printedWidthIn}
          printedHeightIn={slicer.printedHeightIn}
          gridMode={slicer.gridMode}
          gridColor={slicer.gridColor}
          gridSizeIn={slicer.gridSizeIn}
          sliceSize={slicer.sliceSize}
          sliceEstimate={slicer.sliceEstimate}
          previewStage={slicer.previewStage}
          sourceSizeReport={slicer.sourceSizeReport}
          sourcePixelWidth={slicer.sourcePixelWidth}
          sourcePixelHeight={slicer.sourcePixelHeight}
          exportDpi={slicer.exportDpi}
        />
      </main>
    </div>
  );
}

export default App;