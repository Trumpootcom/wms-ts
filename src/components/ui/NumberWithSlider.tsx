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
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "block",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        {label}
      </label>

      <input
        type="number"
        min={min}
        max={max}
        step={stepInput}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "50%",
          boxSizing: "border-box",
          padding: "8px",
          marginBottom: "8px",
        }}
      />

      <input
        type="range"
        min={min}
        max={max}
        step={stepSlider}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}

export default NumberWithSlider;