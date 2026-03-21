import {
  buildParallelLineFamilyInRect,
  normalFromLineAngleDegrees,
  type GridLineSegment,
} from "./gridMath.ts";

type LineSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function drawLineSegments(
  ctx: CanvasRenderingContext2D,
  segments: LineSegment[],
) {
  for (const segment of segments) {
    ctx.beginPath();
    ctx.moveTo(segment.x1, segment.y1);
    ctx.lineTo(segment.x2, segment.y2);
    ctx.stroke();
  }
}

function getMapGridSegmentsInInches(
  printedWidthIn: number,
  printedHeightIn: number,
  gridPerspectiveAngle: number,
  gridSizeIn: number,
): GridLineSegment[] {
  const rect = {
    x: 0,
    y: 0,
    width: printedWidthIn,
    height: printedHeightIn,
  };

  if (gridPerspectiveAngle === 0) {
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

function convertMapSegmentsToTilePixels(
  segmentsInInches: GridLineSegment[],
  tileXIn: number,
  tileYIn: number,
  dpi: number,
): LineSegment[] {
  return segmentsInInches.map((segment) => ({
    x1: (segment.x1 - tileXIn) * dpi,
    y1: (segment.y1 - tileYIn) * dpi,
    x2: (segment.x2 - tileXIn) * dpi,
    y2: (segment.y2 - tileYIn) * dpi,
  }));
}

function drawStyledGrid(
  ctx: CanvasRenderingContext2D,
  tileWidthPx: number,
  tileHeightPx: number,
  tileXIn: number,
  tileYIn: number,
  printedWidthIn: number,
  printedHeightIn: number,
  gridPerspectiveAngle: number,
  gridRotation: number,
  gridSizeIn: number,
  dpi: number,
  strokeStyle: string,
  lineWidth: number,
  lineDash: number[],
) {
  const mapSegmentsInInches = getMapGridSegmentsInInches(
    printedWidthIn,
    printedHeightIn,
    gridPerspectiveAngle,
    gridSizeIn,
  );

  const tileSegments = convertMapSegmentsToTilePixels(
    mapSegmentsInInches,
    tileXIn,
    tileYIn,
    dpi,
  );

  const mapCenterLocalX = (printedWidthIn / 2 - tileXIn) * dpi;
  const mapCenterLocalY = (printedHeightIn / 2 - tileYIn) * dpi;

  ctx.save();

  ctx.beginPath();
  ctx.rect(0, 0, tileWidthPx, tileHeightPx);
  ctx.clip();

  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(lineDash);

  ctx.translate(mapCenterLocalX, mapCenterLocalY);
  ctx.rotate((gridRotation * Math.PI) / 180);
  ctx.translate(-mapCenterLocalX, -mapCenterLocalY);

  drawLineSegments(ctx, tileSegments);
  ctx.restore();
}

export function drawLineGrid(
  ctx: CanvasRenderingContext2D,
  tileWidthPx: number,
  tileHeightPx: number,
  tileXIn: number,
  tileYIn: number,
  printedWidthIn: number,
  printedHeightIn: number,
  gridPerspectiveAngle: number,
  gridRotation: number,
  gridSizeIn: number,
  dpi: number,
  strokeStyle: string,
) {
  drawStyledGrid(
    ctx,
    tileWidthPx,
    tileHeightPx,
    tileXIn,
    tileYIn,
    printedWidthIn,
    printedHeightIn,
    gridPerspectiveAngle,
    gridRotation,
    gridSizeIn,
    dpi,
    strokeStyle,
    2,
    [],
  );
}

export function drawDashedGrid(
  ctx: CanvasRenderingContext2D,
  tileWidthPx: number,
  tileHeightPx: number,
  tileXIn: number,
  tileYIn: number,
  printedWidthIn: number,
  printedHeightIn: number,
  gridPerspectiveAngle: number,
  gridRotation: number,
  gridSizeIn: number,
  dpi: number,
  strokeStyle: string,
) {
  const dash = 0.125 * gridSizeIn * dpi;
  const gap = 0.125 * gridSizeIn * dpi;

  drawStyledGrid(
    ctx,
    tileWidthPx,
    tileHeightPx,
    tileXIn,
    tileYIn,
    printedWidthIn,
    printedHeightIn,
    gridPerspectiveAngle,
    gridRotation,
    gridSizeIn,
    dpi,
    strokeStyle,
    3,
    [dash / 2, gap, dash, gap, dash / 2, 0],
  );
}

export function drawCornerGrid(
  ctx: CanvasRenderingContext2D,
  tileWidthPx: number,
  tileHeightPx: number,
  tileXIn: number,
  tileYIn: number,
  printedWidthIn: number,
  printedHeightIn: number,
  gridPerspectiveAngle: number,
  gridRotation: number,
  gridSizeIn: number,
  dpi: number,
  strokeStyle: string,
) {
  const dash = 0.125 * gridSizeIn * dpi;
  const gap = 0.75 * gridSizeIn * dpi;

  drawStyledGrid(
    ctx,
    tileWidthPx,
    tileHeightPx,
    tileXIn,
    tileYIn,
    printedWidthIn,
    printedHeightIn,
    gridPerspectiveAngle,
    gridRotation,
    gridSizeIn,
    dpi,
    strokeStyle,
    3,
    [dash, gap, dash, 0],
  );
}