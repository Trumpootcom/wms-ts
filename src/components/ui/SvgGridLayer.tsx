import type { GridColor, GridMode, GridSize } from "../../slicer/types.ts";

type SvgGridLayerProps = {
    printedWidthIn: number;
    printedHeightIn: number;
    gridMode: GridMode;
    gridPerspectiveAngle: number;
    gridRotation: number;
    gridColor: GridColor;
    gridSizeIn: GridSize;
};

function getGridPositions(
    tileStartIn: number,
    tileSizeIn: number,
    gridSizeIn: number,
): number[] {
    const epsilon = 0.000001;
    const start = Math.ceil(tileStartIn / gridSizeIn - epsilon) * gridSizeIn;
    const end = tileStartIn + tileSizeIn + epsilon;

    const positions: number[] = [];
    for (let inch = start; inch <= end; inch += gridSizeIn) {
        positions.push(inch);
    }

    return positions;
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

    let strokeDasharray: string | undefined;
    if (gridMode === "dash") {
        strokeDasharray = [
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
    } else if (gridMode === "corner") {
        strokeDasharray = [
            0.125 * gridSizeIn,
            0.75 * gridSizeIn,
            0.125 * gridSizeIn,
            0,
        ].join(" ");
    }

    const gridLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

    if (gridPerspectiveAngle === 90) {
        const verticals = getGridPositions(0, printedWidthIn, gridSizeIn);
        const horizontals = getGridPositions(0, printedHeightIn, gridSizeIn);

        for (const x of verticals) {
            gridLines.push({
                x1: x,
                y1: 0,
                x2: x,
                y2: printedHeightIn,
            });
        }

        for (const y of horizontals) {
            gridLines.push({
                x1: 0,
                y1: y,
                x2: printedWidthIn,
                y2: y,
            });
        }
    } else {
        const tanAngle = Math.tan((gridPerspectiveAngle * Math.PI) / 180);
        const run = printedHeightIn / tanAngle;
        const step = gridSizeIn;

        // Family 1: positive slope
        for (let startX = -run; startX <= printedWidthIn; startX += step) {
            gridLines.push({
                x1: startX,
                y1: 0,
                x2: startX + run,
                y2: printedHeightIn,
            });
        }

        // Family 2: negative slope
        for (let startX = 0; startX <= printedWidthIn + run; startX += step) {
            gridLines.push({
                x1: startX,
                y1: 0,
                x2: startX - run,
                y2: printedHeightIn,
            });
        }
    }

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