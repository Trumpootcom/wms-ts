import type { ReactNode } from "react";
import { theme } from "../../theme.ts";

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
        background: theme.panel.background,
        overflow: "hidden",
        border: `1px solid ${theme.panel.border}`,
        boxShadow: theme.panel.horizontalInsetShadow,
        marginBottom,
        display: "grid",
        gridTemplateRows: "auto minmax(0, 1fr)",
        ...(fillHeight
          ? {
              height: "100%",
              minHeight: 0,
              minWidth: 0,
            }
          : {}),
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          fontWeight: 700,
          padding: "6px 10px",
          background: theme.panel.headerBackground,
          borderBottom: `1px solid ${theme.panel.headerBorder}`,
          boxShadow: theme.panel.headerInsetShadow,
          fontSize: "13px",
          color: theme.panel.text,
        }}
      >
        {title}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: bodyPadding,
          boxShadow: theme.panel.bodyInsetShadow,
          minHeight: 0,
          minWidth: 0,
          boxSizing: "border-box",
          ...(fillHeight
            ? {
                display: "grid",
                overflow: "hidden",
              }
            : {}),
        }}
      >
        {children}
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
