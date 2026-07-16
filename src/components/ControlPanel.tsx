import type { useSlicerState } from "../hooks/useSlicerState.ts";
import { theme } from "../theme.ts";
import GridControls from "./controls/GridControls.tsx";
import ImageControls from "./controls/ImageControls.tsx";
import OutputControls from "./controls/OutputControls.tsx";
import ExportActions from "./controls/ExportActions.tsx";
import ProjectsPane from "./controls/ProjectsPane.tsx";

type ControlPanelProps = {
  slicer: ReturnType<typeof useSlicerState>;
};

function ControlPanel({ slicer }: ControlPanelProps) {
  return (
    <aside
      style={{
        minHeight: 0,
        display: "grid",
        gridAutoRows: "max-content",
        alignContent: "start",
        gap: "8px",
        overflowY: "auto",
        paddingRight: "2px",
      }}
    >
      <ProjectsPane slicer={slicer} />
      <ImageControls slicer={slicer} />
      <GridControls slicer={slicer} />
      <OutputControls slicer={slicer} />
      <ExportActions slicer={slicer} />

      {slicer.exportMessage && (
        <div style={{ marginTop: "12px", color: theme.panel.mutedText, fontSize: "14px" }}>
          {slicer.exportMessage}
        </div>
      )}
    </aside>
  );
}

export default ControlPanel;
