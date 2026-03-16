import ControlPanel from "./components/ControlPanel.tsx";
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
          padding: "10px",
        }}
      >
        <h1 style={{ margin: 0 }}>VTT Slicer</h1>
      </header>

      <main
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: "0",
          padding: "0",
          minHeight: "calc(100vh - 69px)",
        }}
      >
        <ControlPanel slicer={slicer} />

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