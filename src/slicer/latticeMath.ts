export type Point = {
  x: number;
  y: number;
};

export type Vector = {
  x: number;
  y: number;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Basis = {
  origin: Point;
  u: Vector;
  v: Vector;
};

export type LatticeCoord = {
  i: number;
  j: number;
};

export type LatticeIndexBounds = {
  iStart: number;
  iEnd: number;
  jStart: number;
  jEnd: number;
};

const EPSILON = 0.000001;

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function rotateVector(vec: Vector, angleDeg: number): Vector {
  const r = degToRad(angleDeg);
  const cos = Math.cos(r);
  const sin = Math.sin(r);

  return {
    x: vec.x * cos - vec.y * sin,
    y: vec.x * sin + vec.y * cos,
  };
}

export function getConstructionRect(
  printedWidthIn: number,
  printedHeightIn: number,
): Rect {
  return {
    x: -printedWidthIn,
    y: -printedHeightIn,
    width: printedWidthIn * 3,
    height: printedHeightIn * 3,
  };
}

export function getGridBasis(
  printedWidthIn: number,
  printedHeightIn: number,
  gridPerspectiveAngle: number,
  gridRotation: number,
  gridSizeIn: number,
  gridPhaseX: number = 0,
  gridPhaseY: number = 0,
): Basis {
  const center = {
    x: printedWidthIn / 2,
    y: printedHeightIn / 2,
  };

  const skew = Math.min(Math.max(gridPerspectiveAngle, 0), 65);
  const intersectionAngle = degToRad(90 - skew);
  const sideLength = gridSizeIn / Math.sin(intersectionAngle);
  const u0: Vector = {
    x: sideLength,
    y: 0,
  };
  const v0: Vector = {
    x: -sideLength * Math.cos(intersectionAngle),
    y: sideLength * Math.sin(intersectionAngle),
  };

  const u = rotateVector(u0, gridRotation);
  const v = rotateVector(v0, gridRotation);

  return {
    origin: {
      x: center.x + gridPhaseX * u.x + gridPhaseY * v.x,
      y: center.y + gridPhaseX * u.y + gridPhaseY * v.y,
    },
    u,
    v,
  };
}

export function invert2x2(
  ux: number,
  uy: number,
  vx: number,
  vy: number,
): {
  a11: number;
  a12: number;
  a21: number;
  a22: number;
} {
  const det = ux * vy - vx * uy;

  if (Math.abs(det) < EPSILON) {
    throw new Error("Grid basis is singular.");
  }

  return {
    a11: vy / det,
    a12: -vx / det,
    a21: -uy / det,
    a22: ux / det,
  };
}

export function paperToLattice(point: Point, basis: Basis): LatticeCoord {
  const dx = point.x - basis.origin.x;
  const dy = point.y - basis.origin.y;

  const inv = invert2x2(basis.u.x, basis.u.y, basis.v.x, basis.v.y);

  return {
    i: inv.a11 * dx + inv.a12 * dy,
    j: inv.a21 * dx + inv.a22 * dy,
  };
}

export function latticeToPaper(
  i: number,
  j: number,
  basis: Basis,
): Point {
  return {
    x: basis.origin.x + i * basis.u.x + j * basis.v.x,
    y: basis.origin.y + i * basis.u.y + j * basis.v.y,
  };
}

export function getLatticeIndexBounds(
  rect: Rect,
  basis: Basis,
  padding = 2,
): LatticeIndexBounds {
  const corners: Point[] = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ];

  const latticeCorners = corners.map((corner) => paperToLattice(corner, basis));

  const iValues = latticeCorners.map((p) => p.i);
  const jValues = latticeCorners.map((p) => p.j);

  return {
    iStart: Math.floor(Math.min(...iValues)) - padding,
    iEnd: Math.ceil(Math.max(...iValues)) + padding,
    jStart: Math.floor(Math.min(...jValues)) - padding,
    jEnd: Math.ceil(Math.max(...jValues)) + padding,
  };
}
