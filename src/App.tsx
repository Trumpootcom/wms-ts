import ControlPanel from "./components/ControlPanel.tsx";
import PreviewPanel from "./components/PreviewPanel.tsx";
import PreviewInfoRow from "./components/PreviewInfoRow.tsx";
import { useSlicerState } from "./hooks/useSlicerState.ts";
import trumpoot from "./assets/trumpoot.svg";

function App() {
  const slicer = useSlicerState();

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateRows: "auto minmax(0, 1fr)",
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
          gridTemplateColumns: "340px minmax(0, 1fr)",
          gap: "8px",
          height: "100%",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
          padding: "8px", 
          boxSizing: "border-box",
        }}
      >
        <ControlPanel slicer={slicer} />

        <div
          style={{
            display: "grid",
            gridTemplateRows: "minmax(0, 1fr) 300px",
            gap: "8px",
            minHeight: 0,
            minWidth: 0,
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <PreviewPanel
            imageUrl={slicer.imageUrl}
            printedWidthIn={slicer.printedWidthIn}
            printedHeightIn={slicer.printedHeightIn}
            gridMode={slicer.gridMode}
            gridPerspectiveAngle={slicer.gridPerspectiveAngle}
            gridRotation={slicer.gridRotation}
            gridColor={slicer.gridColor}
            gridSizeIn={slicer.gridSizeIn}
            gridPhaseX={slicer.gridPhaseX}
            gridPhaseY={slicer.gridPhaseY}
            gridLineThickness={slicer.gridLineThickness}
            sliceSize={slicer.sliceSize}
            sliceEstimate={slicer.sliceEstimate}
            sourceSizeReport={slicer.sourceSizeReport}
            sourcePixelWidth={slicer.sourcePixelWidth}
            sourcePixelHeight={slicer.sourcePixelHeight}
            exportDpi={slicer.exportDpi}
            imageAdjustments={slicer.imageAdjustments}
            imageZoom={slicer.imageZoom}
            imageOffsetX={slicer.imageOffsetX}
            imageOffsetY={slicer.imageOffsetY}
          />

          <PreviewInfoRow
            printedWidthIn={slicer.printedWidthIn}
            printedHeightIn={slicer.printedHeightIn}
            gridMode={slicer.gridMode}
            gridColor={slicer.gridColor}
            gridSizeIn={slicer.gridSizeIn}
            sliceSize={slicer.sliceSize}
            sliceEstimate={slicer.sliceEstimate}
            sourceSizeReport={slicer.sourceSizeReport}
            sourcePixelWidth={slicer.sourcePixelWidth}
            sourcePixelHeight={slicer.sourcePixelHeight}
            exportDpi={slicer.exportDpi}
            imageAdjustments={slicer.imageAdjustments}
            imageZoom={slicer.imageZoom}
            imageOffsetX={slicer.imageOffsetX}
            imageOffsetY={slicer.imageOffsetY}
          />
        </div>
      </main>
    </div>
  );
}

export default App;