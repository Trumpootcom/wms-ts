import type { ReactNode } from "react";

type PanelSectionProps = {
  title: string;
  children: ReactNode;
  bodyPadding?: string;
  fillHeight?: boolean;
  marginBottom?: string;
};

function PanelSection({
  title,
  children,
  bodyPadding = "10px",
  fillHeight = false,
  marginBottom,
}: PanelSectionProps) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: "8px",
        background: "#e8eaec",
        overflow: "hidden",
        border: "1px solid #4d525c80",
        marginBottom,
        ...(fillHeight
          ? {
              height: "100%",
              minHeight: 0,
              display: "grid",
              gridTemplateRows: "auto minmax(0, 1fr)",
            }
          : {}),
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          ...(fillHeight
            ? {
                height: "100%",
                minHeight: 0,
                display: "grid",
                gridTemplateRows: "auto minmax(0, 1fr)",
              }
            : {}),
        }}
      >
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

        <div
          style={{
            padding: bodyPadding,
            ...(fillHeight
              ? {
                  height: "100%",
                  minHeight: 0,
                  boxSizing: "border-box",
                }
              : {}),
          }}
        >
          {children}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "8px",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </div>
  );
}

export default PanelSection;
