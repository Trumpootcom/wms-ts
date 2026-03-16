// src/components/ui/PanelSection.tsx
import type { ReactNode } from "react";

type PanelSectionProps = {
  title: string;
  children: ReactNode;
  marginBottom?: string;
};

function PanelSection({
  title,
  children,
  marginBottom = "20px",
}: PanelSectionProps) {
  return (
    <div
      style={{
        marginBottom,
        border: "1px solid #d1d5db",
        borderRadius: "10px",
        padding: "12px",
        background: "#f9fafb",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: "10px" }}>{title}</div>
      {children}
    </div>
  );
}

export default PanelSection;