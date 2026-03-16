type NumberWithSliderProps = {
    label: string;
    value: number;
    min: number;
    max: number;
    stepInput?: number;
    stepSlider?: number;
    onChange: (value: number) => void;
};

function NumberWithSlider({
    label,
    value,
    min,
    max,
    stepInput = 0.1,
    stepSlider = 0.5,
    onChange,
}: NumberWithSliderProps) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
            }}
        >
            {/* LABEL */}
            <div
                style={{
                    width: "95px",
                    fontWeight: 700,
                    fontSize: "14px",
                    textAlign: "left",
                }}
            >
                {label}
            </div>

            {/* SLIDER */}
            <input
                type="range"
                min={min}
                max={max}
                step={stepSlider}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{
                    flex: 1,
                }}
            />

            {/* NUMBER */}
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
                    background: "#f9fafb"
                }}
            />
        </div>
    );
}

export default NumberWithSlider;