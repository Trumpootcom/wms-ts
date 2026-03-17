type GridMode = "none" | "line" | "dash" | "corner";

type GridModeIconProps = {
    mode: GridMode;
    size?: number;
};

function GridModeIcon({ mode, size = 20 }: GridModeIconProps) {
    const common = {
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1,
        strokeLinecap: "round" as const,
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            aria-hidden="true"
            style={{ display: "block" }}
        >
            {/*
    {mode === "none" && (
        <rect x="0" y="0" width="20" height="20" {...common} />
    )}
*/}

            {mode === "line" && (
                <>
                    <rect x="0" y="0" width="20" height="20" {...common} />
                    <line x1="10" y1="0" x2="10" y2="20" {...common} />
                    <line x1="0" y1="10" x2="20" y2="10" {...common} />
                </>
            )}

            {mode === "dash" && (
                <>
                    <rect
                        x="0"
                        y="0"
                        width="20"
                        height="20"
                        {...common}
                        strokeDasharray="2 2"
                    />
                    <line
                        x1="10"
                        y1="0"
                        x2="10"
                        y2="20"
                        {...common}
                        strokeDasharray="2 2"
                    />
                    <line
                        x1="0"
                        y1="10"
                        x2="20"
                        y2="10"
                        {...common}
                        strokeDasharray="2 2"
                    />
                </>
            )}

            {mode === "corner" && (
                <>
<line x1="0" y1="0" x2="3" y2="0" {...common} />
<line x1="8" y1="0" x2="12" y2="0" {...common} />
<line x1="17" y1="0" x2="20" y2="0" {...common} />

<line x1="0" y1="10" x2="3" y2="10" {...common} />
<line x1="8" y1="10" x2="12" y2="10" {...common} />
<line x1="17" y1="10" x2="20" y2="10" {...common} />

<line x1="0" y1="20" x2="3" y2="20" {...common} />
<line x1="8" y1="20" x2="12" y2="20" {...common} />
<line x1="17" y1="20" x2="20" y2="20" {...common} />

<line x1="1" y1="0" x2="1" y2="3" {...common} />
<line x1="1" y1="8" x2="1" y2="12" {...common} />
<line x1="1" y1="17" x2="1" y2="20" {...common} />

<line x1="10" y1="0" x2="10" y2="3" {...common} />
<line x1="10" y1="8" x2="10" y2="12" {...common} />
<line x1="10" y1="17" x2="10" y2="20" {...common} />

<line x1="19" y1="0" x2="19" y2="3" {...common} />
<line x1="19" y1="8" x2="19" y2="12" {...common} />
<line x1="19" y1="17" x2="19" y2="20" {...common} />                
</>
            )}
        </svg>
    );
}

export default GridModeIcon;