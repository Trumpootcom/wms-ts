export type GridLineSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type GridRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

const EPSILON = 0.000001;

function dot(ax: number, ay: number, bx: number, by: number): number {
  return ax * bx + ay * by;
}

function uniquePoints(points: Point[]): Point[] {
  const out: Point[] = [];

  for (const point of points) {
    const alreadyExists = out.some(
      (p) =>
        Math.abs(p.x - point.x) < EPSILON &&
        Math.abs(p.y - point.y) < EPSILON,
    );

    if (!alreadyExists) {
      out.push(point);
    }
  }

  return out;
}

function intersectInfiniteLineWithRect(
  normalX: number,
  normalY: number,
  offset: number,
  rect: GridRect,
): Point[] {
  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;

  const points: Point[] = [];

  // Intersect with x = left
  if (Math.abs(normalY) > EPSILON) {
    const y = (offset - normalX * left) / normalY;
    if (y >= top - EPSILON && y <= bottom + EPSILON) {
      points.push({ x: left, y });
    }
  }

  // Intersect with x = right
  if (Math.abs(normalY) > EPSILON) {
    const y = (offset - normalX * right) / normalY;
    if (y >= top - EPSILON && y <= bottom + EPSILON) {
      points.push({ x: right, y });
    }
  }

  // Intersect with y = top
  if (Math.abs(normalX) > EPSILON) {
    const x = (offset - normalY * top) / normalX;
    if (x >= left - EPSILON && x <= right + EPSILON) {
      points.push({ x, y: top });
    }
  }

  // Intersect with y = bottom
  if (Math.abs(normalX) > EPSILON) {
    const x = (offset - normalY * bottom) / normalX;
    if (x >= left - EPSILON && x <= right + EPSILON) {
      points.push({ x, y: bottom });
    }
  }

  return uniquePoints(points);
}

export function buildParallelLineFamilyInRect(
  rect: GridRect,
  normalX: number,
  normalY: number,
  spacing: number,
): GridLineSegment[] {
  const corners: Point[] = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ];

  const projections = corners.map((corner) =>
    dot(normalX, normalY, corner.x, corner.y),
  );

  const minProjection = Math.min(...projections);
  const maxProjection = Math.max(...projections);

  const startIndex = Math.ceil(minProjection / spacing - EPSILON);
  const endIndex = Math.floor(maxProjection / spacing + EPSILON);

  const segments: GridLineSegment[] = [];

  for (let k = startIndex; k <= endIndex; k += 1) {
    const offset = k * spacing;
    const intersections = intersectInfiniteLineWithRect(
      normalX,
      normalY,
      offset,
      rect,
    );

    if (intersections.length < 2) continue;

    segments.push({
      x1: intersections[0].x,
      y1: intersections[0].y,
      x2: intersections[1].x,
      y2: intersections[1].y,
    });
  }

  return segments;
}

export function normalFromLineAngleDegrees(angleDeg: number): {
  normalX: number;
  normalY: number;
} {
  const radians = (angleDeg * Math.PI) / 180;
  const dirX = Math.cos(radians);
  const dirY = Math.sin(radians);

  return {
    normalX: -dirY,
    normalY: dirX,
  };
}