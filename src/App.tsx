import ControlPanel from "./components/ControlPanel.tsx";
import PreviewPanel from "./components/PreviewPanel.tsx";
import { useSlicerState } from "./hooks/useSlicerState.ts";
import trumpoot from "./assets/trumpoot.svg";

function App() {
  const slicer = useSlicerState();

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        background: "#f3f4f6",
        color: "#111827",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          background: "#204170",
          color: "white",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ margin: 0 }}>VTT Slicer</h1>

        <img
          src={trumpoot}
          alt="Trumpoot logo"
          style={{
            height: "40px",
            width: "auto",
            display: "block",
          }}
        />
      </header>
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1px 1fr",
          gap: "0",
          padding: "0",
          height: "100%",
        }}
      >
        <ControlPanel slicer={slicer} />
        <div
          style={{
            background: "#9ca3af",
            width: "1px",
          }}
        />
        <PreviewPanel
          imageUrl={slicer.imageUrl}
          printedWidthIn={slicer.printedWidthIn}
          printedHeightIn={slicer.printedHeightIn}
          gridMode={slicer.gridMode}
          gridPerspectiveAngle={slicer.gridPerspectiveAngle}
          gridRotation={slicer.gridRotation}
          gridColor={slicer.gridColor}
          gridSizeIn={slicer.gridSizeIn}
          sliceSize={slicer.sliceSize}
          sliceEstimate={slicer.sliceEstimate}
          previewStage={slicer.previewStage}
          sourceSizeReport={slicer.sourceSizeReport}
          sourcePixelWidth={slicer.sourcePixelWidth}
          sourcePixelHeight={slicer.sourcePixelHeight}
          exportDpi={slicer.exportDpi}
          imageAdjustments={slicer.imageAdjustments}
        />
      </main>
    </div>
  );
}

export default App;