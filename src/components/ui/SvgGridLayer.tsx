import type { GridColor, GridMode, GridSize } from "../../slicer/types.ts";
import {
    buildParallelLineFamilyInRect,
    type GridLineSegment,
    normalFromLineAngleDegrees,
} from "../../slicer/gridMath.ts";

type SvgGridLayerProps = {
    printedWidthIn: number;
    printedHeightIn: number;
    gridMode: GridMode;
    gridPerspectiveAngle: number;
    gridRotation: number;
    gridColor: GridColor;
    gridSizeIn: GridSize;
};

function getStrokeDasharray(
    gridMode: GridMode,
    gridSizeIn: GridSize,
): string | undefined {
    if (gridMode === "dash") {
        return [
            (3 / 32) * gridSizeIn,
            (1 / 16) * gridSizeIn,
            (2 / 16) * gridSizeIn,
            (1 / 16) * gridSizeIn,
            (2 / 16) * gridSizeIn,
            (1 / 16) * gridSizeIn,
            (2 / 16) * gridSizeIn,
            (1 / 16) * gridSizeIn,
            (2 / 16) * gridSizeIn,
            (1 / 16) * gridSizeIn,
            (3 / 32) * gridSizeIn,
            0,
        ].join(" ");
    }

    if (gridMode === "corner") {
        return [
            0.125 * gridSizeIn,
            0.75 * gridSizeIn,
            0.125 * gridSizeIn,
            0,
        ].join(" ");
    }

    return undefined;
}

function getPreviewGridSegments(
    printedWidthIn: number,
    printedHeightIn: number,
    gridPerspectiveAngle: number,
    gridSizeIn: GridSize,
): GridLineSegment[] {
    const rect = {
        x: 0,
        y: 0,
        width: printedWidthIn,
        height: printedHeightIn,
    };

    if (gridPerspectiveAngle === 90) {
        const verticalNormal = normalFromLineAngleDegrees(90);
        const horizontalNormal = normalFromLineAngleDegrees(0);

        return [
            ...buildParallelLineFamilyInRect(
                rect,
                verticalNormal.normalX,
                verticalNormal.normalY,
                gridSizeIn,
            ),
            ...buildParallelLineFamilyInRect(
                rect,
                horizontalNormal.normalX,
                horizontalNormal.normalY,
                gridSizeIn,
            ),
        ];
    }

const familyAngleA = gridPerspectiveAngle;
const familyAngleB = -gridPerspectiveAngle;
    const normalA = normalFromLineAngleDegrees(familyAngleA);
    const normalB = normalFromLineAngleDegrees(familyAngleB);

    return [
        ...buildParallelLineFamilyInRect(
            rect,
            normalA.normalX,
            normalA.normalY,
            gridSizeIn,
        ),
        ...buildParallelLineFamilyInRect(
            rect,
            normalB.normalX,
            normalB.normalY,
            gridSizeIn,
        ),
    ];
}

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
    const strokeDasharray = getStrokeDasharray(gridMode, gridSizeIn);

    const gridLines = getPreviewGridSegments(
        printedWidthIn,
        printedHeightIn,
        gridPerspectiveAngle,
        gridSizeIn,
    );

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
            <g
                transform={`rotate(${gridRotation} ${printedWidthIn / 2} ${printedHeightIn / 2})`}
            >
                {gridLines.map((line, index) => (
                    <line
                        key={`grid-${index}`}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                        shapeRendering="crispEdges"
                        strokeLinecap="butt"
                    />
                ))}
            </g>
        </svg>
    );
}

export default SvgGridLayer;