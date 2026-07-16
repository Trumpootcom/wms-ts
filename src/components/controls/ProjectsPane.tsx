import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { theme } from "../../theme.ts";
import PanelSection from "../ui/PanelSection.tsx";
import type { SlicerControlsProps } from "./controlTypes.ts";
import ProjectThumbnail from "./ProjectThumbnail.tsx";

const buttonStyle = {
  border: `1px solid ${theme.control.buttonBorder}`,
  borderRadius: "6px",
  padding: "6px 9px",
  color: theme.control.buttonText,
  fontWeight: 700,
  boxShadow: theme.control.buttonInsetHighlight,
} as const;

function formatSavedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ProjectMenu({ name, children }: { name: string; children: (close: () => void) => ReactNode }) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  function close() {
    setIsOpen(false);
  }

  function toggle() {
    if (isOpen) {
      close();
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuHeight = 142;
    const top = rect.bottom + menuHeight <= window.innerHeight - 8
      ? rect.bottom + 4
      : Math.max(8, rect.top - menuHeight - 4);
    setPosition({ left: Math.max(8, rect.right - 120), top });
    setIsOpen(true);
  }

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) close();
    };
    const handleScroll = () => close();
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Actions for ${name}`}
        aria-expanded={isOpen}
        title="Project actions"
        onClick={toggle}
        style={{ width: "30px", height: "36px", display: "grid", placeItems: "center", border: `1px solid ${theme.control.border}`, borderRadius: "5px", background: theme.control.lightBackground, fontSize: "20px", fontWeight: 800, lineHeight: 1, cursor: "pointer" }}
      >
        ⋮
      </button>
      {isOpen ? createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", left: position.left, top: position.top, zIndex: 100, width: "120px", display: "grid", padding: "4px", border: `1px solid ${theme.control.buttonBorder}`, borderRadius: "6px", background: theme.control.lightBackground, boxShadow: "0 5px 14px hsl(42 20% 10% / 28%)", boxSizing: "border-box" }}
        >
          {children(close)}
        </div>,
        document.body,
      ) : null}
    </>
  );
}

export default function ProjectsPane({ slicer }: SlicerControlsProps) {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const saveDisabled = !slicer.imageUrl || !slicer.imageBlob;

  return (
    <div style={{ height: "390px", minHeight: "390px" }}>
    <PanelSection title={`Projects (${slicer.localProjects.length})`} bodyPadding="8px" fillHeight>
      <div style={{ minHeight: 0, display: "grid", gridTemplateRows: "auto minmax(0, 1fr)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
        <button
          type="button"
          disabled={saveDisabled}
          onClick={slicer.handleSaveProject}
          style={{
            ...buttonStyle,
            background: saveDisabled
              ? `linear-gradient(to bottom, ${theme.control.buttonDisabledTop}, ${theme.control.buttonDisabledBottom})`
              : `linear-gradient(to bottom, ${theme.control.buttonPrimaryTop}, ${theme.control.buttonPrimaryBottom})`,
            cursor: saveDisabled ? "not-allowed" : "pointer",
          }}
        >
          Save Locally
        </button>
        <button
          type="button"
          onClick={() => importInputRef.current?.click()}
          style={{ ...buttonStyle, background: `linear-gradient(to bottom, ${theme.control.buttonPrimaryTop}, ${theme.control.buttonPrimaryBottom})`, cursor: "pointer" }}
        >
          Import
        </button>
        <input ref={importInputRef} type="file" accept=".wmsts,application/zip,application/vnd.trumpoot.wmsts+zip" onChange={slicer.handleOpenProject} style={{ display: "none" }} />
      </div>

      <div style={{ minHeight: 0, overflowY: "auto", display: "grid", alignContent: "start", gap: "6px", paddingRight: "2px" }}>
        {slicer.localProjects.length === 0 ? (
          <div style={{ padding: "18px 8px", textAlign: "center", color: theme.panel.mutedText, fontSize: "13px" }}>
            No locally saved projects yet.
          </div>
        ) : slicer.localProjects.map((project) => {
          const isActive = project.id === slicer.activeLocalProjectId;
          return (
            <article
              key={project.id}
              style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "5px", alignItems: "center", padding: "5px", border: `1px solid ${isActive ? theme.control.selectedBorder : theme.control.border}`, borderRadius: "6px", background: isActive ? theme.control.selectedBackground : theme.control.background }}
            >
              <button
                type="button"
                title={`Open ${project.name}`}
                onClick={() => void slicer.handleOpenLocalProject(project.id)}
                style={{ minWidth: 0, display: "grid", gridTemplateColumns: "64px minmax(0, 1fr)", gap: "8px", alignItems: "center", padding: 0, border: 0, background: "transparent", color: theme.panel.text, textAlign: "left", cursor: "pointer" }}
              >
                <ProjectThumbnail blob={project.thumbnailBlob} name={project.name} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700, fontSize: "13px" }}>{project.name}</span>
                  <span style={{ display: "block", marginTop: "3px", color: theme.panel.mutedText, fontSize: "10px" }}>{formatSavedAt(project.updatedAt)}</span>
                </span>
              </button>

              <ProjectMenu name={project.name}>
                {(close) => <>
                  <button type="button" onClick={() => { close(); void slicer.handleOpenLocalProject(project.id); }} style={{ padding: "6px 8px", border: 0, background: "transparent", textAlign: "left", cursor: "pointer" }}>Open</button>
                  <button type="button" onClick={() => { close(); const name = window.prompt("Project name", project.name); if (name) void slicer.handleRenameLocalProject(project.id, name); }} style={{ padding: "6px 8px", border: 0, background: "transparent", textAlign: "left", cursor: "pointer" }}>Rename</button>
                  <button type="button" onClick={() => { close(); void slicer.handleExportLocalProject(project.id); }} style={{ padding: "6px 8px", border: 0, background: "transparent", textAlign: "left", cursor: "pointer" }}>Export</button>
                  <button type="button" onClick={() => { close(); if (window.confirm(`Delete “${project.name}” from this browser?`)) void slicer.handleDeleteLocalProject(project.id); }} style={{ padding: "6px 8px", border: 0, borderTop: `1px solid ${theme.control.border}`, background: "transparent", color: "hsl(5 70% 35%)", textAlign: "left", cursor: "pointer" }}>Delete</button>
                </>}
              </ProjectMenu>
            </article>
          );
        })}
      </div>
      </div>
    </PanelSection>
    </div>
  );
}
