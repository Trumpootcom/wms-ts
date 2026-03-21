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
};

function NumberWithSlider({
    label,
    value,
    defaultValue,
    min,
    max,
    stepInput = 0.1,
    stepSlider = 0.5,
    onChange,
}: NumberWithSliderProps) {

    const isModified = value !== defaultValue;

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
                title={`Reset to default (${defaultValue})`}
                style={{
                    ...controlLabelStyle,
                    
                    flex: "0 0 100px",

                    padding: "2px 6px",
                    borderRadius: "4px",
                    border: "1px solid #9ca3af",
                    background: isModified ? "#fde68a" : "#e5e7eb",

                    color: isModified ? "#92400e" : "#374151",

                    fontWeight: 600,

                    cursor: "pointer",
                    userSelect: "none",
                }}
            >
                {label}
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
                    type="range"
                    min={min}
                    max={max}
                    step={stepSlider}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    style={{
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
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    style={{
                        width: "44px",
                        padding: "3px 4px",
                        textAlign: "right",
                        border: "1px solid #9ca3af",
                        borderRadius: "4px",
                        background: "#f9fafb",
                    }}
                />
            </div>
        </div>
    );
}

export default NumberWithSlider;