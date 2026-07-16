import { DEFAULT_HEIGHT_IN, DEFAULT_WIDTH_IN } from "../../slicer/defaults.ts";
import { theme } from "../../theme.ts";
import LabeledSegmentedControl from "../ui/LabeledSegmentedControl.tsx";
import NumberWithSlider from "../ui/NumberWithSlider.tsx";
import PanelSection from "../ui/PanelSection.tsx";
import type { SlicerControlsProps } from "./controlTypes.ts";

export default function OutputControls({ slicer }: SlicerControlsProps) {
  return (
    <PanelSection title="Output Controls ">
      <NumberWithSlider label="Width" value={slicer.printedWidthIn} min={8} max={36} defaultValue={DEFAULT_WIDTH_IN} onChange={slicer.updateWidth} />
      <NumberWithSlider label="Height" value={slicer.printedHeightIn} min={8} max={36} defaultValue={DEFAULT_HEIGHT_IN} onChange={slicer.updateHeight} />
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", color: slicer.imageAspectRatio ? theme.control.labelText : theme.control.disabledText, opacity: slicer.imageAspectRatio ? 1 : 0.6 }}>
          <input type="checkbox" checked={slicer.maintainAspectRatio} disabled={!slicer.imageAspectRatio} onChange={slicer.handleAspectRatioToggle} style={{ accentColor: theme.control.checkboxAccent }} />
          Maintain aspect ratio
        </label>
      </div>
      <LabeledSegmentedControl label="Orient" value={slicer.sliceOrientation} onChange={slicer.setSliceOrientation} options={[
        { value: "portrait", title: "Portrait" },
        { value: "landscape", title: "Landscape" },
      ]} />
      <LabeledSegmentedControl label="Slicer" value={slicer.sliceSize} onChange={slicer.setSliceSize} options={[
        { value: "8x10", title: "8 x 10" },
        { value: "8x10.5", title: "8 x 10.5" },
        { value: "ledger", title: "Ledger" },
      ]} />
    </PanelSection>
  );
}
