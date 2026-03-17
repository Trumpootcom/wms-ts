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
  marginBottom = "5px",
}: PanelSectionProps) {
  return (
    <div
      style={{
        position: "relative",
        marginBottom,
        borderRadius: "8px",
        background: "#e8eaec",
        overflow: "hidden",
        border: "1px solid #4d525c80",
      }}
    >
      {/* CONTENT */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* HEADER */}
        <div
          style={{
            fontWeight: 700,
            padding: "6px 10px",
            background: "#9aa3af",
            borderBottom: "1px solid #6b7280",
            fontSize: "13px",
            color: "#111827",
          }}
        >
          {title}
        </div>

        {/* BODY */}
        <div
          style={{
            padding: "10px",
          }}
        >
          {children}
        </div>
      </div>

      {/* SUNKEN OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "8px",
          pointerEvents: "none",
          zIndex: 2,
          /*          boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.85)",
            */
        }}
      />
    </div>
  );
}

export default PanelSection;