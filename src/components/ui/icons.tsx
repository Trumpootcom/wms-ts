import type { ReactNode } from "react";

export type SvgIconName =
    | "gridNone"
    | "gridLine"
    | "gridDash"
    | "gridCorner"
    | "colorBlack"
    | "colorWhite"
    ;

const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1,
    strokeLinecap: "round" as const,
};

export const icons: Record<SvgIconName, () => ReactNode> = {
    gridNone: () => (
        <rect x="0" y="0" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1" />
    ),
    gridLine: () => (
        <>
            <rect x="0" y="0" width="20" height="20" {...common} />
            <line x1="10" y1="0" x2="10" y2="20" {...common} />
            <line x1="0" y1="10" x2="20" y2="10" {...common} />
        </>
    ),

    gridDash: () => (
        <>
            <rect x="0" y="0" width="20" height="20" {...common} strokeDasharray="2 2" />
            <line x1="10" y1="0" x2="10" y2="20" {...common} strokeDasharray="2 2" />
            <line x1="0" y1="10" x2="20" y2="10" {...common} strokeDasharray="2 2" />
        </>
    ),

    gridCorner: () => (
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
    ),

    colorBlack: () => (
        <rect
            x="0.5"
            y="0.5"
            width="19"
            height="19"
            fill="black"
            stroke="black"
            strokeWidth="1"
        />
    ),

    colorWhite: () => (
        <rect
            x="0.5"
            y="0.5"
            width="19"
            height="19"
            fill="white"
            stroke="black"
            strokeWidth="1"
        />
    ),


};