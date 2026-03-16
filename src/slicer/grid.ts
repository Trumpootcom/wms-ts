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

export function drawLineGrid(
  ctx: CanvasRenderingContext2D,
  tileWidthPx: number,
  tileHeightPx: number,
  tileXIn: number,
  tileYIn: number,
  tileWidthIn: number,
  tileHeightIn: number,
  gridSizeIn: number,
  dpi: number,
  strokeStyle: string,
) {
  ctx.save();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 2;

  const verticals = getGridPositions(tileXIn, tileWidthIn, gridSizeIn);
  for (const inch of verticals) {
    const x = (inch - tileXIn) * dpi;
    if (x < 0 || x > tileWidthPx) continue;
    const crispX = Math.round(x) + 0.5;
    ctx.beginPath();
    ctx.moveTo(crispX, 0);
    ctx.lineTo(crispX, tileHeightPx);
    ctx.stroke();
  }

  const horizontals = getGridPositions(tileYIn, tileHeightIn, gridSizeIn);
  for (const inch of horizontals) {
    const y = (inch - tileYIn) * dpi;
    if (y < 0 || y > tileHeightPx) continue;
    const crispY = Math.round(y) + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, crispY);
    ctx.lineTo(tileWidthPx, crispY);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawDashedGrid(
  ctx: CanvasRenderingContext2D,
  tileWidthPx: number,
  tileHeightPx: number,
  tileXIn: number,
  tileYIn: number,
  tileWidthIn: number,
  tileHeightIn: number,
  gridSizeIn: number,
  dpi: number,
  strokeStyle: string,
) {
  ctx.save();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 3;
  const dash = 0.125 * gridSizeIn * dpi;
  const gap = 0.125 * gridSizeIn * dpi;
  ctx.setLineDash([dash/2, gap, dash,gap, dash/2,0]);

  const verticals = getGridPositions(tileXIn, tileWidthIn, gridSizeIn);
  for (const inch of verticals) {
    const x = (inch - tileXIn) * dpi;
    if (x < 0 || x > tileWidthPx) continue;
    const crispX = Math.round(x) + 0.5;
    ctx.beginPath();
    ctx.moveTo(crispX, 0);
    ctx.lineTo(crispX, tileHeightPx);
    ctx.stroke();
  }

  const horizontals = getGridPositions(tileYIn, tileHeightIn, gridSizeIn);
  for (const inch of horizontals) {
    const y = (inch - tileYIn) * dpi;
    if (y < 0 || y > tileHeightPx) continue;
    const crispY = Math.round(y) + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, crispY);
    ctx.lineTo(tileWidthPx, crispY);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawCornerGrid(
  ctx: CanvasRenderingContext2D,
  tileWidthPx: number,
  tileHeightPx: number,
  tileXIn: number,
  tileYIn: number,
  tileWidthIn: number,
  tileHeightIn: number,
  gridSizeIn: number,
  dpi: number,
  strokeStyle: string,
) {
  ctx.save();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 3;
  const dash = 0.125 * gridSizeIn * dpi;
  const gap = 0.75 * gridSizeIn * dpi;
  ctx.setLineDash([dash, gap, dash,0]);

  const verticals = getGridPositions(tileXIn, tileWidthIn, gridSizeIn);
  for (const inch of verticals) {
    const x = (inch - tileXIn) * dpi;
    if (x < 0 || x > tileWidthPx) continue;
    const crispX = Math.round(x) + 0.5;
    ctx.beginPath();
    ctx.moveTo(crispX, 0);
    ctx.lineTo(crispX, tileHeightPx);
    ctx.stroke();
  }

  const horizontals = getGridPositions(tileYIn, tileHeightIn, gridSizeIn);
  for (const inch of horizontals) {
    const y = (inch - tileYIn) * dpi;
    if (y < 0 || y > tileHeightPx) continue;
    const crispY = Math.round(y) + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, crispY);
    ctx.lineTo(tileWidthPx, crispY);
    ctx.stroke();
  }

  ctx.restore();
}