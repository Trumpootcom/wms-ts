import type { useSlicerState } from "../../hooks/useSlicerState.ts";

export type SlicerControlsProps = {
  slicer: ReturnType<typeof useSlicerState>;
};
