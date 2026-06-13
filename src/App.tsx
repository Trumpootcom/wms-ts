import ControlPanel from "./components/ControlPanel.tsx";
import PreviewPanel from "./components/PreviewPanel.tsx";
import PreviewInfoRow from "./components/PreviewInfoRow.tsx";
import { useSlicerState } from "./hooks/useSlicerState.ts";
import titlebarLeft from "./assets/trumpoot_titlebar_a.png";
import titlebarFill from "./assets/trumpoot_titlebar_b.png";
import { theme } from "./theme.ts";

const titlebarHeightPx = 40;
const titlebarLeftAspectRatio = 171 / 98;
const titlebarLeftWidthPx = titlebarHeightPx * titlebarLeftAspectRatio;

function App() {
  const slicer = useSlicerState();

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateRows: "auto minmax(0, 1fr)",
        background: theme.app.background,
        color: theme.app.text,
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          position: "relative",
          minHeight: `${titlebarHeightPx}px`,
          backgroundColor: theme.app.titlebarFallback,
          backgroundImage: `url(${titlebarFill})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: theme.control.sliderTrackDark,
          padding: "0 14px",
          paddingLeft: `${titlebarLeftWidthPx + 14}px`,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={titlebarLeft}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: "auto",
            display: "block",
            pointerEvents: "none",
          }}
        />

        <h1
          style={{
            position: "relative",
            zIndex: 1,
            margin: 0,
            textShadow: `0 1px 2px ${theme.app.titlebarTextShadow}`,
          }}
        >
          Map Slicer Tool Suite
        </h1>
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
            gridTemplateRows: "minmax(0, 1fr) 240px",
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
            sliceOrientation={slicer.sliceOrientation}
            sliceEstimate={slicer.sliceEstimate}
            sourceSizeReport={slicer.sourceSizeReport}
            sourcePixelWidth={slicer.sourcePixelWidth}
            sourcePixelHeight={slicer.sourcePixelHeight}
            exportDpi={slicer.exportDpi}
            imageAdjustments={slicer.imageAdjustments}
            imageZoom={slicer.imageZoom}
            imageOffsetX={slicer.imageOffsetX}
            imageOffsetY={slicer.imageOffsetY}
            setImageZoom={slicer.setImageZoom}
            setImageOffsetX={slicer.setImageOffsetX}
            setImageOffsetY={slicer.setImageOffsetY}
            setGridSizeIn={slicer.setGridSizeIn}
            setGridPhaseX={slicer.setGridPhaseX}
            setGridPhaseY={slicer.setGridPhaseY}
          />

          <PreviewInfoRow
            printedWidthIn={slicer.printedWidthIn}
            printedHeightIn={slicer.printedHeightIn}
            gridMode={slicer.gridMode}
            gridColor={slicer.gridColor}
            gridSizeIn={slicer.gridSizeIn}
            sliceSize={slicer.sliceSize}
            sliceOrientation={slicer.sliceOrientation}
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
