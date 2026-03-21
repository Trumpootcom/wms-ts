export type GridColor = "black" | "white" | "gray";
export type GridMode = "none" | "line" | "dash" | "corner" ;

export type SliceSize = "8x10" | "8x10.5";
export type GridSize = 0.75 | 1 | 1.25 | 1.5;

export type ImageAdjustments = {
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  saturation: number; // -100 to 100
  gamma: number;      // 0.5 to 2.0
};

export type Tile = {
  row: number;
  col: number;
  xIn: number;
  yIn: number;
  widthIn: number;
  heightIn: number;
  label: string;
};

export type SliceEstimate = {
  cols: number;
  rows: number;
  total: number;
  tiles: Tile[];
};