import type { GridColor, GridMode, GridSize } from "../../slicer/types.ts";
import { buildGridLineSegments } from "../../slicer/gridPrimitives.ts";

type SvgGridLayerProps = {
    printedWidthIn: number;
    printedHeightIn: number;
    gridMode: GridMode;
    gridPerspectiveAngle: number;
    gridRotation: number;
    gridColor: GridColor;
    gridSizeIn: GridSize;
};

function SvgGridLayer({
    printedWidthIn,
    printedHeightIn,
    gridMode,
    gridPerspectiveAngle,
    gridRotation,
    gridColor,
    gridSizeIn,
}: SvgGridLayerProps) {
    if (gridMode === "none") return null;

    const stroke =
        gridColor === "black" ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)";

    const strokeWidth = 0.05;

    const segments = buildGridLineSegments({
        printedWidthIn,
        printedHeightIn,
        gridMode,
        gridPerspectiveAngle,
        gridRotation,
        gridSizeIn,
        dashCount: 4,
    });

    return (
        <svg
            viewBox={`0 0 ${printedWidthIn} ${printedHeightIn}`}
            preserveAspectRatio="none"
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                overflow: "hidden",
            }}
        >
            {segments.map((segment, index) => (
                <line
                    key={`grid-${index}`}
                    x1={segment.x1}
                    y1={segment.y1}
                    x2={segment.x2}
                    y2={segment.y2}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    shapeRendering="crispEdges"
                    strokeLinecap="butt"
                />
            ))}
        </svg>
    );
}

export default SvgGridLayer;