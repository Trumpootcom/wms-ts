export const IMAGE_ADJUSTMENT_CONFIG = {
  zoom: { neutral: 100, min: 100, max: 400, step: 0.1, wheelStep: 5, fastWheelStep: 100 },
  brightness: { neutral: 100, min: 0, max: 200 },
  exposure: { neutral: 0, min: -1.5, max: 1.5, step: 0.01 },
  contrast: { neutral: 100, min: 0, max: 200 },
  saturation: { neutral: 100, min: 0, max: 200 },
  vibrance: { neutral: 0, min: -100, max: 100 },
  shadows: { neutral: 0, min: -100, max: 100, strength: 1.6 },
  highlights: { neutral: 0, min: -100, max: 100, strength: 1.6 },
  curve: { neutralInput: 128, neutralOutput: 128, min: 0, max: 255 },
  perspective: { neutral: 0, min: -1, max: 1, maxInset: 0.1, step: 0.01 },
  levels: { neutralBlack: 0, neutralWhite: 255, blackMin: 0, blackMax: 127, whiteMin: 128, whiteMax: 255 },
  gamma: { neutral: 1, min: 0.4, max: 1.5, step: 0.01 },
} as const;
