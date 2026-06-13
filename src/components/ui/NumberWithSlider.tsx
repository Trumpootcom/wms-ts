import type { CSSProperties } from "react";
import { useState } from "react";
import { theme } from "../../theme.ts";
import { controlLabelStyle } from "./uiStyles.ts";

type NumberWithSliderProps = {
    label: string;
    value: number;
    defaultValue: number;
    min: number;
    max: number;
    stepInput?: number;
    stepSlider?: number;
    onChange: (value: number) => void;
    suffix?: string,
};

function NumberWithSlider({
    label,
    value,
    defaultValue,
    min,
    max,
    stepInput = 0.01,
    stepSlider = 0.01,
    onChange,
    suffix,
}: NumberWithSliderProps) {
    const [draftValue, setDraftValue] = useState(String(value));
    const [isEditing, setIsEditing] = useState(false);

    const isModified = value !== defaultValue;
    const displayedValue = isEditing ? draftValue : String(value);
    const sliderProgress =
        max === min ? 0 : ((value - min) / (max - min)) * 100;
    const sliderStyle = {
        "--slider-progress": `${Math.min(Math.max(sliderProgress, 0), 100)}%`,
        "--slider-fill": theme.control.sliderTrackDark,
        "--slider-track": theme.control.sliderTrackBright,
        "--slider-thumb": theme.control.sliderThumb,
        "--slider-thumb-border": theme.control.sliderThumbBorder,
    } as CSSProperties;

    function commitDraftValue() {
        const nextValue = Number(draftValue);

        if (!Number.isFinite(nextValue)) {
            setDraftValue(String(value));
            return;
        }

        const clampedValue = Math.min(Math.max(nextValue, min), max);
        onChange(clampedValue);
        setDraftValue(String(clampedValue));
    }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "5px",
                marginBottom: "8px",
            }}
        >
            <button
                type="button"
                onClick={() => onChange(defaultValue)}
                title={
                    isModified
                        ? `Reset ${label} to default (${defaultValue})`
                        : `${label} is at default (${defaultValue})`
                }
                aria-label={
                    isModified
                        ? `Reset ${label} to default value ${defaultValue}`
                        : `${label}, default value ${defaultValue}`
                }
                style={{
                    ...controlLabelStyle,

                    flex: "0 0 100px",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "6px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    border: `1px solid ${theme.control.border}`,
                    background: isModified
                        ? theme.control.modifiedBackground
                        : theme.control.resetBackground,

                    color: isModified
                        ? theme.control.modifiedText
                        : theme.control.labelText,

                    fontWeight: 600,

                    cursor: isModified ? "pointer" : "default",
                    userSelect: "none",
                    boxShadow: isModified
                        ? `inset 0 -2px 0 ${theme.control.sliderTrackDark}`
                        : "none",
                }}
            >
                <span>{label}</span>
                {isModified && (
                    <span
                        aria-hidden="true"
                        style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            lineHeight: 1,
                        }}
                    >
                        ↺
                    </span>
                )}
            </button>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "5px",
                    flex: "0 0 200px",
                }}
            >
                <input
                    className="number-slider"
                    type="range"
                    min={min}
                    max={max}
                    step={stepSlider}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    style={{
                        ...sliderStyle,
                        flex: "1 1 auto",
                        minWidth: 60,
                        maxWidth: 140,
                    }}
                />

                <input
                    type="number"
                    min={min}
                    max={max}
                    step={stepInput}
                    value={displayedValue}
                    onFocus={() => {
                        setIsEditing(true);
                        setDraftValue(String(value));
                    }}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onBlur={() => {
                        setIsEditing(false);
                        commitDraftValue();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.currentTarget.blur();
                        }

                        if (e.key === "Escape") {
                            setDraftValue(String(value));
                            e.currentTarget.blur();
                        }
                    }}
                    style={{
                        width: "44px",
                        padding: "3px 4px",
                        textAlign: "right",
                        border: `1px solid ${theme.control.border}`,
                        borderRadius: "4px",
                        background: theme.control.inputBackground,
                    }}

                />
                {suffix && (
                    <span style={{ fontSize: "12px", color: theme.panel.mutedText }}>
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}

export default NumberWithSlider;
