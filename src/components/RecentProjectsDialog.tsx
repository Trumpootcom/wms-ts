import { useEffect } from "react";
import type { useSlicerState } from "../hooks/useSlicerState.ts";
import { theme } from "../theme.ts";

type Props = {
  slicer: ReturnType<typeof useSlicerState>;
};

const buttonStyle = {
  border: `1px solid ${theme.control.buttonBorder}`,
  borderRadius: "6px",
  padding: "6px 9px",
  background: `linear-gradient(to bottom, ${theme.control.buttonPrimaryTop}, ${theme.control.buttonPrimaryBottom})`,
  color: theme.control.buttonText,
  boxShadow: theme.control.buttonInsetHighlight,
  fontWeight: 700,
  cursor: "pointer",
} as const;

function formatSavedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function RecentProjectsDialog({ slicer }: Props) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") slicer.setIsRecentProjectsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slicer]);

  return (
    <div
      role="presentation"
      onMouseDown={() => slicer.setIsRecentProjectsOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 30,
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "hsl(42 15% 5% / 48%)",
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="recent-projects-title"
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: "min(720px, 100%)",
          maxHeight: "min(680px, calc(100vh - 48px))",
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr)",
          border: `1px solid ${theme.panel.border}`,
          borderRadius: "8px",
          overflow: "hidden",
          background: theme.panel.background,
          boxShadow: "0 18px 42px hsl(42 20% 5% / 42%)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            background: theme.panel.headerBackground,
            borderBottom: `1px solid ${theme.panel.headerBorder}`,
          }}
        >
          <h2 id="recent-projects-title" style={{ margin: 0, fontSize: "20px" }}>
            Recent Projects
          </h2>
          <button
            type="button"
            aria-label="Close recent projects"
            onClick={() => slicer.setIsRecentProjectsOpen(false)}
            style={buttonStyle}
          >
            Close
          </button>
        </header>

        <div style={{ overflow: "auto", padding: "14px" }}>
          {slicer.localProjects.length === 0 ? (
            <div style={{ padding: "28px", textAlign: "center", color: theme.panel.mutedText }}>
              No local projects yet. Load an image and choose Save Locally.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "8px" }}>
              {slicer.localProjects.map((project) => (
                <article
                  key={project.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    gap: "12px",
                    alignItems: "center",
                    padding: "12px",
                    border: `1px solid ${theme.control.border}`,
                    borderRadius: "7px",
                    background: theme.control.background,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {project.name}
                    </div>
                    <div style={{ marginTop: "3px", fontSize: "12px", color: theme.panel.mutedText }}>
                      Saved {formatSavedAt(project.updatedAt)}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "end", gap: "6px" }}>
                    <button type="button" style={buttonStyle} onClick={() => void slicer.handleOpenLocalProject(project.id)}>
                      Open
                    </button>
                    <button
                      type="button"
                      style={buttonStyle}
                      onClick={() => {
                        const name = window.prompt("Project name", project.name);
                        if (name) void slicer.handleRenameLocalProject(project.id, name);
                      }}
                    >
                      Rename
                    </button>
                    <button type="button" style={buttonStyle} onClick={() => void slicer.handleExportLocalProject(project.id)}>
                      Export
                    </button>
                    <button
                      type="button"
                      style={buttonStyle}
                      onClick={() => {
                        if (window.confirm(`Delete “${project.name}” from this browser?`)) {
                          void slicer.handleDeleteLocalProject(project.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
