import type { GridColor } from "./types";

export const GRID_COLORS: Record<string, string> = {
    black: "rgba(0,0,0,0.95)",
    white: "rgba(255,255,255,0.95)",
    gray: "rgba(107,114,128,0.95)",
    red: "rgba(220,38,38,0.95)",
    blue: "rgba(37,99,235,0.95)",
};

export function resolveGridColor(color: GridColor): string {
    return GRID_COLORS[color] ?? color;
}

export const PAGE_GRID_COLOR = "rgba(220,38,38,0.95)";
