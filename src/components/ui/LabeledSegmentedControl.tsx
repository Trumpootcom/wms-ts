import type { ReactNode } from "react";
import { controlLabelStyle } from "./uiStyles";

type LabeledSegmentedOption<T extends string | number> = {
    value: T;
    icon?: ReactNode;
    title: string;
};

type LabeledSegmentedControlProps<T extends string | number> = {
    label: string;
    value: T;
    onChange: (value: T) => void;
    options: LabeledSegmentedOption<T>[];
    marginBottom?: string;
};

function LabeledSegmentedControl<T extends string | number>({
    label,
    value,
    onChange,
    options,
    marginBottom = "12px",
}: LabeledSegmentedControlProps<T>) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                marginBottom,
            }}
        >
            <div style={controlLabelStyle}>{label}</div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "4px",
                }}
            >
                {options.map((option) => {
                    const selected = option.value === value;

                    return (
                        <button
                            key={String(option.value)}
                            type="button"
                            title={option.title}
                            onClick={() => onChange(option.value)}
                            style={{
                                padding: "4px",
                                border: "2px solid",
                                borderColor: selected ? "#1d4ed8" : "#9ca3af",
                                borderRadius: "8px",
                                background: selected ? "#dbeafe" : "#f3f4f6",
                                color: "#111827",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flex: "0 0 auto",
                                fontSize: "13px",
                                fontWeight: 600,
                            }}
                        >
                            {option.icon ? option.icon : option.title}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default LabeledSegmentedControl;