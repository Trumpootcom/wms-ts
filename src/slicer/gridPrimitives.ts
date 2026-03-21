import type { GridMode } from "./types.ts";
import {
  getGridBasis,
  getLatticeIndexBounds,
  latticeToPaper,
} from "./latticeMath.ts";
import { getDashedEdgeSegments } from "./dashMath.ts";

export type GridLineSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type GridCircle = {
  cx: number;
  cy: number;
  r: number;
};

export type GridPrimitives = {
  lineSegments: GridLineSegment[];
  circles: GridCircle[];
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type BuildGridPrimitiveArgs = {
  printedWidthIn: number;
  printedHeightIn: number;
  gridMode: GridMode;
  gridPerspectiveAngle: number;
  gridRotation: number;
  gridSizeIn: number;
  dashCount?: number;
};

function getVectorLength(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function isPointInRect(point: { x: number; y: number }, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function doesSegmentIntersectRect(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  rect: Rect,
): boolean {
  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;

  if (isPointInRect(p1, rect) || isPointInRect(p2, rect)) {
    return true;
  }

  if (p1.x < left && p2.x < left) return false;
  if (p1.x > right && p2.x > right) return false;
  if (p1.y < top && p2.y < top) return false;
  if (p1.y > bottom && p2.y > bottom) return false;

  return true;
}

export function buildGridPrimitives({
  printedWidthIn,
  printedHeightIn,
  gridMode,
  gridPerspectiveAngle,
  gridRotation,
  gridSizeIn,
  dashCount = 4,
}: BuildGridPrimitiveArgs): GridPrimitives {
  const pageRect: Rect = {
    x: 0,
    y: 0,
    width: printedWidthIn,
    height: printedHeightIn,
  };

  const basis = getGridBasis(
    printedWidthIn,
    printedHeightIn,
    gridPerspectiveAngle,
    gridRotation,
    gridSizeIn,
  );

  const bounds = getLatticeIndexBounds(pageRect, basis, 1);

  const lineSegments: GridLineSegment[] = [];
  const circles: GridCircle[] = [];

  const uLen = getVectorLength(basis.u.x, basis.u.y);
  const vLen = getVectorLength(basis.v.x, basis.v.y);

  const uUnit = {
    x: basis.u.x / uLen,
    y: basis.u.y / uLen,
  };

  const vUnit = {
    x: basis.v.x / vLen,
    y: basis.v.y / vLen,
  };

  if (gridMode === "none") {
    return { lineSegments:[], circles: [] };
    const radius = gridSizeIn / 2;

    for (let i = bounds.iStart; i < bounds.iEnd; i += 1) {
      for (let j = bounds.jStart; j < bounds.jEnd; j += 1) {
        const center = latticeToPaper(i + 0.5, j + 0.5, basis);

        if (!isPointInRect(center, pageRect)) {
          continue;
        }

        circles.push({
          cx: center.x,
          cy: center.y,
          r: radius,
        });
      }
    }

    return { lineSegments, circles };
  }

  if (gridMode === "corner") {
    const uHalfStub = uLen / 8;
    const vHalfStub = vLen / 8;

    for (let i = bounds.iStart; i <= bounds.iEnd; i += 1) {
      for (let j = bounds.jStart; j <= bounds.jEnd; j += 1) {
        const point = latticeToPaper(i, j, basis);

        if (!isPointInRect(point, pageRect)) {
          continue;
        }

        lineSegments.push({
          x1: point.x - uUnit.x * uHalfStub,
          y1: point.y - uUnit.y * uHalfStub,
          x2: point.x + uUnit.x * uHalfStub,
          y2: point.y + uUnit.y * uHalfStub,
        });

        lineSegments.push({
          x1: point.x - vUnit.x * vHalfStub,
          y1: point.y - vUnit.y * vHalfStub,
          x2: point.x + vUnit.x * vHalfStub,
          y2: point.y + vUnit.y * vHalfStub,
        });
      }
    }
  }

  if (gridMode === "line") {
    for (let i = bounds.iStart; i <= bounds.iEnd; i += 1) {
      for (let j = bounds.jStart; j <= bounds.jEnd; j += 1) {
        const p = latticeToPaper(i, j, basis);
        const pU = latticeToPaper(i + 1, j, basis);
        const pV = latticeToPaper(i, j + 1, basis);

        if (doesSegmentIntersectRect(p, pU, pageRect)) {
          lineSegments.push({
            x1: p.x,
            y1: p.y,
            x2: pU.x,
            y2: pU.y,
          });
        }

        if (doesSegmentIntersectRect(p, pV, pageRect)) {
          lineSegments.push({
            x1: p.x,
            y1: p.y,
            x2: pV.x,
            y2: pV.y,
          });
        }
      }
    }
  }

  if (gridMode === "dash") {
    for (let i = bounds.iStart; i <= bounds.iEnd; i += 1) {
      for (let j = bounds.jStart; j <= bounds.jEnd; j += 1) {
        const p = latticeToPaper(i, j, basis);
        const pU = latticeToPaper(i + 1, j, basis);
        const pV = latticeToPaper(i, j + 1, basis);

        if (doesSegmentIntersectRect(p, pU, pageRect)) {
          lineSegments.push(...getDashedEdgeSegments(p, pU, dashCount));
        }

        if (doesSegmentIntersectRect(p, pV, pageRect)) {
          lineSegments.push(...getDashedEdgeSegments(p, pV, dashCount));
        }
      }
    }
  }

  return { lineSegments, circles };
}

export function buildGridLineSegments(
  args: BuildGridPrimitiveArgs,
): GridLineSegment[] {
  return buildGridPrimitives(args).lineSegments;
}