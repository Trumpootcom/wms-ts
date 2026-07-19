export const IMAGE_ADJUSTMENT_CONFIG = {
  brightness: { neutral: 100, min: 0, max: 200 },
  exposure: { neutral: 0, min: -1.5, max: 1.5, step: 0.05 },
  contrast: { neutral: 100, min: 0, max: 200 },
  shadows: { neutral: 0, min: -100, max: 100, strength: 1.6 },
  highlights: { neutral: 0, min: -100, max: 100, strength: 1.6 },
  curve: { neutralInput: 128, neutralOutput: 128, min: 0, max: 255 },
  perspective: { neutral: 0, min: -1, max: 1, maxInset: 0.1, step: 0.01 },
} as const;
