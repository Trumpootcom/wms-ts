import type { ReactNode } from "react";

type Option<T extends string | number> = {
  value: T;
  label: ReactNode;
};

type SegmentedControlProps<T extends string | number> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  marginBottom?: string;
  wrap?: boolean;
  isLightOption?: (value: T) => boolean;
};

function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  marginBottom = "0",
  wrap = false,
  isLightOption,
}: SegmentedControlProps<T>) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexWrap: wrap ? "wrap" : "nowrap",
        background: "#e5e7eb",
        borderRadius: "999px",
        padding: "4px",
        gap: "4px",
        marginBottom,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const lightSelected = selected && isLightOption?.(option.value);

        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "8px 16px",
              cursor: "pointer",
              background: selected
                ? lightSelected
                  ? "white"
                  : "#111827"
                : "transparent",
              color: selected && !lightSelected ? "white" : "#111827",
              fontWeight: 700,
              boxShadow: lightSelected
                ? "0 0 0 1px rgba(0,0,0,0.12) inset"
                : "none",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;