import { useRef } from "react";
import { theme } from "../../theme.ts";
import NumberWithSlider from "../ui/NumberWithSlider.tsx";
import PanelSection from "../ui/PanelSection.tsx";
import type { SlicerControlsProps } from "./controlTypes.ts";

export default function ImageControls({ slicer }: SlicerControlsProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <PanelSection title="Image Controls">
      <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          style={{ border: `1px solid ${theme.control.buttonBorder}`, borderRadius: "6px", padding: "5px 9px", background: `linear-gradient(to bottom, ${theme.control.buttonPrimaryTop} 0%, ${theme.control.buttonPrimary} 45%, ${theme.control.buttonPrimaryBottom} 100%)`, color: theme.control.buttonText, fontWeight: 700, boxShadow: theme.control.buttonInsetHighlight, cursor: "pointer" }}
        >
          Choose File
        </button>
        <span
          title={slicer.imageUrl ? slicer.imageFileName : "No file chosen"}
          style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: slicer.imageUrl ? theme.panel.text : theme.panel.mutedText, fontSize: "13px" }}
        >
          {slicer.imageUrl ? slicer.imageFileName : "No file chosen"}
        </span>
        <input ref={imageInputRef} type="file" accept="image/*" onChange={slicer.handleFileUpload} style={{ display: "none" }} />
      </div>
      <NumberWithSlider label="Bright" value={slicer.imageAdjustments.brightness} min={0} max={200} defaultValue={100} stepInput={1} stepSlider={1} onChange={(value) => slicer.updateImageAdjustment("brightness", value)} />
      <NumberWithSlider label="Contrast" value={slicer.imageAdjustments.contrast} min={0} max={200} defaultValue={100} stepInput={1} stepSlider={1} onChange={(value) => slicer.updateImageAdjustment("contrast", value)} />
      <NumberWithSlider label="Saturation" value={slicer.imageAdjustments.saturation} min={0} max={200} defaultValue={100} stepInput={1} stepSlider={1} onChange={(value) => slicer.updateImageAdjustment("saturation", value)} />
      <NumberWithSlider label="Gamma" value={slicer.imageAdjustments.gamma} min={0.2} max={3} defaultValue={1} stepInput={0.1} stepSlider={0.1} onChange={(value) => slicer.updateImageAdjustment("gamma", value)} />
      <NumberWithSlider label="Shadow Lift" value={slicer.imageAdjustments.shadowLift} min={0} max={100} defaultValue={0} stepInput={1} stepSlider={1} onChange={(value) => slicer.updateImageAdjustment("shadowLift", value)} />
      <NumberWithSlider label="Zoom" value={slicer.imageZoom} defaultValue={100} min={100} max={200} stepInput={0.1} stepSlider={0.1} onChange={slicer.setImageZoom} />
      <NumberWithSlider label="Offset X" value={slicer.imageOffsetX} defaultValue={0} min={-100} max={100} stepInput={0.1} stepSlider={0.1} onChange={slicer.setImageOffsetX} />
      <NumberWithSlider label="Offset Y" value={slicer.imageOffsetY} defaultValue={0} min={-100} max={100} stepInput={0.1} stepSlider={0.1} onChange={slicer.setImageOffsetY} />
    </PanelSection>
  );
}
