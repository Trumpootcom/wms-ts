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
  ctx.lineWidth = 1;

  const epsilon = 0.000001;

  const startVertical = Math.ceil(tileXIn / gridSizeIn - epsilon) * gridSizeIn;
  const endVertical = tileXIn + tileWidthIn + epsilon;

  for (let inch = startVertical; inch <= endVertical; inch += gridSizeIn) {
    const x = (inch - tileXIn) * dpi;
    if (x < 0 || x > tileWidthPx) continue;
    const crispX = Math.round(x) + 0.5;
    ctx.beginPath();
    ctx.moveTo(crispX, 0);
    ctx.lineTo(crispX, tileHeightPx);
    ctx.stroke();
  }

  const startHorizontal =
    Math.ceil(tileYIn / gridSizeIn - epsilon) * gridSizeIn;
  const endHorizontal = tileYIn + tileHeightIn + epsilon;

  for (let inch = startHorizontal; inch <= endHorizontal; inch += gridSizeIn) {
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
