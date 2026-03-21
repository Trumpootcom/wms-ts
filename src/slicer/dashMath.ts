export type Point = {
  x: number;
  y: number;
};

export type LineSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  key?: string;
};

export function getDashedEdgeSegments(
  start: Point,
  end: Point,
  dashCount: number,
): LineSegment[] {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (!Number.isFinite(length) || length <= 0) {
    return [];
  }

  if (!Number.isFinite(dashCount) || dashCount < 2) {
    return [
      {
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
      },
    ];
  }

  const ux = dx / length;
  const uy = dy / length;

  const fullDash = length / (2 * (dashCount - 1));
  const halfDash = fullDash / 2;
  const gap = fullDash;

  if (
    !Number.isFinite(fullDash) ||
    !Number.isFinite(halfDash) ||
    !Number.isFinite(gap) ||
    fullDash <= 0
  ) {
    return [];
  }

  const segments: LineSegment[] = [];

  let cursor = 0;

  const pushSegment = (a: number, b: number) => {
    const startLen = Math.max(0, Math.min(a, length));
    const endLen = Math.max(0, Math.min(b, length));

    if (endLen <= startLen) return;

    segments.push({
      x1: start.x + ux * startLen,
      y1: start.y + uy * startLen,
      x2: start.x + ux * endLen,
      y2: start.y + uy * endLen,
    });
  };

  pushSegment(0, halfDash);
  cursor = halfDash;

  for (let k = 0; k < dashCount - 2; k += 1) {
    cursor += gap;
    pushSegment(cursor, cursor + fullDash);
    cursor += fullDash;
  }

  cursor += gap;
  pushSegment(cursor, cursor + halfDash);

  return segments;
}