import { theme } from "../../theme.ts";
import type { SlicerControlsProps } from "./controlTypes.ts";

export default function ExportActions({ slicer }: SlicerControlsProps) {
  return (
    <button
      type="button"
      disabled={!slicer.imageUrl || slicer.isExporting}
      onClick={slicer.handleExportPdf}
      style={{
        width: "100%",
        border: `1px solid ${theme.control.buttonBorder}`,
        borderRadius: "10px",
        padding: "12px 16px",
        background: !slicer.imageUrl || slicer.isExporting
          ? `linear-gradient(to bottom, ${theme.control.buttonDisabledTop} 0%, ${theme.control.buttonDisabled} 45%, ${theme.control.buttonDisabledBottom} 100%)`
          : `linear-gradient(to bottom, ${theme.control.buttonPrimaryTop} 0%, ${theme.control.buttonPrimary} 45%, ${theme.control.buttonPrimaryBottom} 100%)`,
        color: theme.control.buttonText,
        fontWeight: 700,
        boxShadow: theme.control.buttonInsetHighlight,
        textShadow: "0 1px 0 hsl(42 85% 92% / 45%)",
        cursor: !slicer.imageUrl || slicer.isExporting ? "not-allowed" : "pointer",
      }}
    >
      {slicer.isExporting ? "Exporting PDF..." : "Export PDF"}
    </button>
  );
}
