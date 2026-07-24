import { useRef, type KeyboardEvent, type PointerEvent } from "react";

export type VectorSlider = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  onChange: (value: number) => void;
};

type Props = {
  sliders: VectorSlider[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function snap(value: number, min: number, max: number, step: number) {
  const snapped = min + Math.round((value - min) / step) * step;
  const precision = Math.max(0, (String(step).split(".")[1] ?? "").length);
  return Number(clamp(snapped, min, max).toFixed(precision));
}

function CompanionSlider({ slider }: { slider: VectorSlider }) {
  const progress = clamp((slider.value - slider.min) / (slider.max - slider.min), 0, 1);
  const gestureRef = useRef<{
    pointerId: number;
    startX: number;
    startTime: number;
    dragging: boolean;
  } | null>(null);

  function updateFromPointer(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const next = slider.min + clamp((event.clientX - rect.left) / rect.width, 0, 1) * (slider.max - slider.min);
    slider.onChange(snap(next, slider.min, slider.max, slider.step));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let direction = 0;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") direction = 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") direction = -1;
    if (event.key === "Home") {
      event.preventDefault();
      slider.onChange(slider.min);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      slider.onChange(slider.max);
      return;
    }
    if (event.key === "Escape" || event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      slider.onChange(slider.defaultValue);
      return;
    }
    if (!direction) return;
    event.preventDefault();
    slider.onChange(snap(
      slider.value + direction * slider.step * (event.shiftKey ? 10 : 1),
      slider.min,
      slider.max,
      slider.step,
    ));
  }

  return (
    <div
      className="vector-companion-slider"
      role="slider"
      tabIndex={0}
      aria-label={slider.label}
      aria-valuemin={slider.min}
      aria-valuemax={slider.max}
      aria-valuenow={slider.value}
      aria-valuetext={`${slider.label}: ${slider.value}`}
      title={`Drag to adjust ${slider.label}; tap to reset`}
      onKeyDown={handleKeyDown}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        gestureRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startTime: Date.now(),
          dragging: false,
        };
      }}
      onPointerMove={(event) => {
        const gesture = gestureRef.current;
        if (!gesture || gesture.pointerId !== event.pointerId) return;
        if (Math.abs(event.clientX - gesture.startX) >= 6) gesture.dragging = true;
        if (gesture.dragging && event.currentTarget.hasPointerCapture(event.pointerId)) {
          updateFromPointer(event);
        }
      }}
      onPointerUp={(event) => {
        const gesture = gestureRef.current;
        if (
          gesture?.pointerId === event.pointerId &&
          !gesture.dragging &&
          Date.now() - gesture.startTime <= 350
        ) {
          slider.onChange(slider.defaultValue);
        }
        gestureRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={() => { gestureRef.current = null; }}
    >
      <div className="vector-companion-track" />
      <div
        className="vector-companion-handle"
        style={{ left: `${progress * 100}%` }}
      >
        <span>{slider.label}</span>
        <output>{slider.value}</output>
      </div>
    </div>
  );
}

export default function VectorSliderTray({ sliders }: Props) {
  if (sliders.length === 0) return null;

  return (
    <section className="vector-slider-tray" aria-label="Vector control sliders">
      {sliders.map((slider) => <CompanionSlider key={slider.id} slider={slider} />)}
    </section>
  );
}
