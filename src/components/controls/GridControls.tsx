import { DEFAULT_GRID_SIZE_IN } from "../../slicer/defaults.ts";
import type { GridSize } from "../../slicer/types.ts";
import LabeledSegmentedControl from "../ui/LabeledSegmentedControl.tsx";
import NumberWithSlider from "../ui/NumberWithSlider.tsx";
import PanelSection from "../ui/PanelSection.tsx";
import SvgIcon from "../ui/SvgIcon.tsx";
import type { SlicerControlsProps } from "./controlTypes.ts";

export default function GridControls({ slicer }: SlicerControlsProps) {
  return (
    <PanelSection title="Grid Controls">
      <LabeledSegmentedControl label="Type" value={slicer.gridMode} onChange={slicer.setGridMode} options={[
        { value: "none", icon: <SvgIcon name="gridNone" size={20} />, title: "None" },
        { value: "line", icon: <SvgIcon name="gridLine" size={20} />, title: "Line" },
        { value: "dash", icon: <SvgIcon name="gridDash" size={20} />, title: "Dash" },
        { value: "corner", icon: <SvgIcon name="gridCorner" size={20} />, title: "Corner" },
      ]} />
      <LabeledSegmentedControl label="Color" value={slicer.gridColor} onChange={slicer.setGridColor} options={[
        { value: "black", icon: <SvgIcon name="colorBlack" size={20} />, title: "Black" },
        { value: "gray", icon: <SvgIcon name="colorGray" size={20} />, title: "Gray" },
        { value: "white", icon: <SvgIcon name="colorWhite" size={20} />, title: "White" },
        { value: "red", icon: <SvgIcon name="colorRed" size={20} />, title: "Red" },
        { value: "blue", icon: <SvgIcon name="colorBlue" size={20} />, title: "Blue" },
      ]} />
      <NumberWithSlider label="Iso Angle" value={slicer.gridPerspectiveAngle} onChange={slicer.setGridPerspectiveAngle} min={0} max={45} defaultValue={0} stepInput={2.5} stepSlider={2.5} />
      <NumberWithSlider label="Rotation" value={slicer.gridRotation} onChange={slicer.setGridRotation} min={-90} max={90} defaultValue={0} stepInput={0.5} stepSlider={0.5} />
      <NumberWithSlider label="Size" value={slicer.gridSizeIn} min={0.5} max={1.5} defaultValue={DEFAULT_GRID_SIZE_IN} stepInput={0.01} stepSlider={0.01} onChange={(value) => slicer.setGridSizeIn(value as GridSize)} />
      <NumberWithSlider label="Stroke" value={slicer.gridLineThickness} min={1} max={5} defaultValue={1} stepSlider={0.1} stepInput={0.1} onChange={slicer.setGridLineThickness} />
      <NumberWithSlider label="X Offset" value={slicer.gridPhaseX} min={-1} max={1} defaultValue={0} stepSlider={0.01} stepInput={0.01} onChange={slicer.setGridPhaseX} />
      <NumberWithSlider label="Y Offset" value={slicer.gridPhaseY} min={-1} max={1} defaultValue={0} stepSlider={0.01} stepInput={0.01} onChange={slicer.setGridPhaseY} />
    </PanelSection>
  );
}
