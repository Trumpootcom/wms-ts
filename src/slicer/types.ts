export type GridColor = "black" | "white" | "gray" | "red" | "blue";
export type GridMode = "none" | "line" | "dash" | "corner" ;

export type SliceSize = "8x10" | "8x10.5" | "ledger";
export type SliceOrientation = "portrait" | "landscape";
export type GridSize = number;

export type ImageAdjustments = {
  brightness: number; // 0 to 200
  exposure: number; // -3 to +3 stops
  contrast: number;   // 0 to 200
  saturation: number; // 0 to 200
  vibrance: number; // -100 to 100
  gamma: number;      // 0.2 to 3.0
  shadowLift: number; // 0 to 100
  shadows: number; // -100 to 100
  highlights: number; // -100 to 100
  curveInput: number; // 0 to 255
  curveOutput: number; // 0 to 255
  perspective: number; // -1 bottom expansion to +1 top expansion
  levelsBlack: number; // 0 to 127
  levelsWhite: number; // 128 to 255
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
