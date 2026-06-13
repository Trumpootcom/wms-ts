import type { ReactNode } from "react";
import { theme } from "../../theme";
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
                                borderColor: selected
                                    ? theme.control.selectedBorder
                                    : theme.control.border,
                                borderRadius: "8px",
                                background: selected
                                    ? theme.control.selectedBackground
                                    : theme.control.background,
                                color: theme.app.text,
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
