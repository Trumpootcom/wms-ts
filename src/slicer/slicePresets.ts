import type { SliceOrientation, SliceSize } from "./types.ts";

export type SlicePreset = {
  id: SliceSize;
  label: string;
  paper: {
    presetId: "letter" | "ledger";
    widthIn: number;
    heightIn: number;
  };
  contentBox: {
    presetId: string;
    widthIn: number;
    heightIn: number;
    marginLeftIn: number;
    marginRightIn: number;
    marginTopIn: number;
    marginBottomIn: number;
  };
};

export const SLICE_PRESETS: Record<SliceSize, SlicePreset> = {
  "8x10": {
    id: "8x10",
    label: "8 x 10",
    paper: {
      presetId: "letter",
      widthIn: 8.5,
      heightIn: 11,
    },
    contentBox: {
      presetId: "letter-8x10",
      widthIn: 8,
      heightIn: 10,
      marginLeftIn: 0.25,
      marginRightIn: 0.25,
      marginTopIn: 0.5,
      marginBottomIn: 0.5,
    },
  },
  "8x10.5": {
    id: "8x10.5",
    label: "8 x 10.5",
    paper: {
      presetId: "letter",
      widthIn: 8.5,
      heightIn: 11,
    },
    contentBox: {
      presetId: "letter-8x10.5",
      widthIn: 8,
      heightIn: 10.5,
      marginLeftIn: 0.25,
      marginRightIn: 0.25,
      marginTopIn: 0.25,
      marginBottomIn: 0.25,
    },
  },
  ledger: {
    id: "ledger",
    label: "Ledger",
    paper: {
      presetId: "ledger",
      widthIn: 11,
      heightIn: 17,
    },
    contentBox: {
      presetId: "ledger-10.5x16.5",
      widthIn: 10.5,
      heightIn: 16.5,
      marginLeftIn: 0.25,
      marginRightIn: 0.25,
      marginTopIn: 0.25,
      marginBottomIn: 0.25,
    },
  },
};

export function getSlicePreset(sliceSize: SliceSize): SlicePreset {
  return SLICE_PRESETS[sliceSize] ?? SLICE_PRESETS["8x10"];
}

export function getSliceContentBox(
  sliceSize: SliceSize,
  sliceOrientation: SliceOrientation = "portrait",
): { widthIn: number; heightIn: number } {
  const contentBox = getSlicePreset(sliceSize).contentBox;

  if (sliceOrientation === "landscape") {
    return {
      widthIn: contentBox.heightIn,
      heightIn: contentBox.widthIn,
    };
  }

  return {
    widthIn: contentBox.widthIn,
    heightIn: contentBox.heightIn,
  };
}
