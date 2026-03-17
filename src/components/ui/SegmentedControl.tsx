import type { ReactNode } from "react";

type SegmentedControlOption<T extends string | number> = {
    value: T;
    label: ReactNode;
    title?: string;
};

type SegmentedControlProps<T extends string | number> = {
    value: T;
    onChange: (value: T) => void;
    options: SegmentedControlOption<T>[];
    wrap?: boolean;
    marginBottom?: string;
    isLightOption?: (value: T) => boolean;
};

function SegmentedControl<T extends string | number>({
    value,
    onChange,
    options,
    wrap = false,
    marginBottom = "0",
    isLightOption,
}: SegmentedControlProps<T>) {
    return (
        <div
            style={{
                display: "flex",
                flexWrap: wrap ? "wrap" : "nowrap",
                gap: "8px",
                marginBottom,
            }}
        >
            {options.map((option) => {
                const selected = option.value === value;
                const lightOption = isLightOption?.(option.value) ?? false;

                return (
                    <button
                        key={String(option.value)}
                        type="button"
                        title={option.title}
                        onClick={() => onChange(option.value)}
                        style={{
                            flex: wrap ? "0 0 auto" : 1,
                            minWidth: wrap ? "72px" : 0,
                            border: selected ? "2px solid #1d4ed8" : "1px solid #9ca3af",
                            borderRadius: "10px",
                            padding: "10px 12px",
                            background: selected
                                ? "#dbeafe"
                                : lightOption
                                  ? "#ffffff"
                                  : "#f3f4f6",
                            color: "#111827",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            lineHeight: 1.1,
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