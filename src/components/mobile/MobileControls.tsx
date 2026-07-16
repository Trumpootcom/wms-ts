import type { CSSProperties, ReactNode } from "react";
import { theme } from "../../theme.ts";

export type FocusedControl = { pane: MobilePaneName; id: string; label: string };
export type MobilePaneName = "Projects" | "Image" | "Grid" | "Page" | "Export";

const iconButton: CSSProperties = {
  width: "32px",
  height: "32px",
  flex: "0 0 32px",
  display: "grid",
  placeItems: "center",
  padding: 0,
  border: `1px solid ${theme.control.border}`,
  borderRadius: "6px",
  background: theme.control.lightBackground,
  color: theme.control.labelText,
  cursor: "pointer",
};

type SliderProps = {
  pane: MobilePaneName;
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  onChange: (value: number) => void;
  focused: boolean;
  onFocus: (control: FocusedControl) => void;
};

export function MobileSliderControl(props: SliderProps) {
  const modified = props.value !== props.defaultValue;
  const progress = ((props.value - props.min) / (props.max - props.min)) * 100;
  const sliderStyle = {
    "--slider-progress": `${Math.min(100, Math.max(0, progress))}%`,
    "--slider-fill": theme.control.sliderTrackDark,
    "--slider-track": theme.control.sliderTrackBright,
    "--slider-thumb": theme.control.sliderThumb,
    "--slider-thumb-border": theme.control.sliderThumbBorder,
  } as CSSProperties;

  return (
    <div style={{ display: "grid", gridTemplateColumns: props.focused ? "32px minmax(80px, 1fr) 52px" : "88px 32px 32px minmax(70px, 1fr) 48px", gap: "5px", alignItems: "center", minHeight: "42px" }}>
      {!props.focused && <span style={{ fontSize: "13px", fontWeight: 700 }}>{props.label}</span>}
      <button type="button" aria-label={`Reset ${props.label}`} disabled={!modified} onClick={() => props.onChange(props.defaultValue)} style={{ ...iconButton, visibility: modified ? "visible" : "hidden" }}>↺</button>
      {!props.focused && <button type="button" aria-label={`Focus ${props.label}`} title={`Focus ${props.label}`} onClick={() => props.onFocus({ pane: props.pane, id: props.id, label: props.label })} style={iconButton}>⌕</button>}
      <input className="number-slider mobile-slider" type="range" min={props.min} max={props.max} step={props.step ?? 0.01} value={props.value} onChange={(event) => props.onChange(Number(event.target.value))} style={{ ...sliderStyle, width: "100%", minWidth: 0 }} />
      <input type="number" inputMode="decimal" min={props.min} max={props.max} step={props.step ?? 0.01} value={props.value} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value)) props.onChange(value); }} style={{ width: "100%", boxSizing: "border-box", padding: "5px 3px", border: `1px solid ${theme.control.border}`, borderRadius: "4px", background: theme.control.inputBackground, textAlign: "right" }} />
    </div>
  );
}

type Choice<T extends string | number> = { value: T; title: string; content?: ReactNode };
type SegmentedProps<T extends string | number> = {
  pane: MobilePaneName;
  id: string;
  label: string;
  value: T;
  defaultValue?: T;
  options: Choice<T>[];
  onChange: (value: T) => void;
  focused: boolean;
  onFocus: (control: FocusedControl) => void;
};

export function MobileSegmentedControl<T extends string | number>(props: SegmentedProps<T>) {
  const modified = props.defaultValue !== undefined && props.value !== props.defaultValue;
  return (
    <div style={{ display: "grid", gridTemplateColumns: props.focused ? "32px minmax(0, 1fr)" : "88px 32px 32px minmax(0, 1fr)", gap: "5px", alignItems: "center", minHeight: "44px" }}>
      {!props.focused && <span style={{ fontSize: "13px", fontWeight: 700 }}>{props.label}</span>}
      <button type="button" aria-label={`Reset ${props.label}`} disabled={!modified} onClick={() => props.defaultValue !== undefined && props.onChange(props.defaultValue)} style={{ ...iconButton, visibility: modified ? "visible" : "hidden" }}>↺</button>
      {!props.focused && <button type="button" aria-label={`Focus ${props.label}`} onClick={() => props.onFocus({ pane: props.pane, id: props.id, label: props.label })} style={iconButton}>⌕</button>}
      <div style={{ minWidth: 0, display: "flex", gap: "4px" }}>
        {props.options.map((option) => <button key={String(option.value)} type="button" title={option.title} onClick={() => props.onChange(option.value)} style={{ flex: "1 1 0", minWidth: 0, minHeight: "34px", padding: "4px", border: "2px solid", borderColor: option.value === props.value ? theme.control.selectedBorder : theme.control.border, borderRadius: "7px", background: option.value === props.value ? theme.control.selectedBackground : theme.control.background, fontWeight: 700, overflow: "hidden" }}>{option.content ?? option.title}</button>)}
      </div>
    </div>
  );
}
