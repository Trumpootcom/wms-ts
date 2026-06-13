export type GridColor = "black" | "white" | "gray";
export type GridMode = "none" | "line" | "dash" | "corner" ;

export type SliceSize = "8x10" | "8x10.5";
export type GridSize = number;

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

export type GridSettings = {
  mode: GridMode;
  color: GridColor;
  sizeIn: GridSize;

  phaseX: number;
  phaseY: number;

  rotation: number;
  perspectiveAngle: number;
};
