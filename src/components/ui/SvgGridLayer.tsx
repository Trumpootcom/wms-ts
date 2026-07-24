import type { GridColor, GridMode, GridSize } from "../../slicer/types.ts";
import { buildGridPrimitives } from "../../slicer/gridPrimitives.ts";
import { resolveGridColor } from "../../slicer/gridConstants.ts";

type SvgGridLayerProps = {
    printedWidthIn: number;
    printedHeightIn: number;
    gridMode: GridMode;
    gridPerspectiveAngle: number;
    gridRotation: number;
    gridColor: GridColor;
    gridSizeIn: GridSize;
    gridPhaseX?: number;
    gridPhaseY?: number;
    gridLineThickness?: number;
};

function SvgGridLayer({
    printedWidthIn,
    printedHeightIn,
    gridMode,
    gridPerspectiveAngle,
    gridRotation,
    gridColor,
    gridSizeIn,
    gridPhaseX = 0,
    gridPhaseY = 0,
    gridLineThickness=1,
}: SvgGridLayerProps) {
    const stroke = resolveGridColor(gridColor);

    const strokeWidth = 0.03 * gridLineThickness;

    const { lineSegments, circles } = buildGridPrimitives({
        printedWidthIn,
        printedHeightIn,
        gridMode,
        gridPerspectiveAngle,
        gridRotation,
        gridSizeIn,
        gridPhaseX,
        gridPhaseY,
        gridLineThickness,
        dashCount: 5,
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
            {lineSegments.map((segment, index) => (
                <line
                    key={`grid-line-${index}`}
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

            {circles.map((circle, index) => (
                <circle
                    key={`grid-circle-${index}`}
                    cx={circle.cx}
                    cy={circle.cy}
                    r={circle.r}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
            ))}
        </svg>
    );
}

export default SvgGridLayer;
