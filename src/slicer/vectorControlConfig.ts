export type SnapTarget = {
  value: number;
  strength: number;
};

export type PeriodicSnapConfig = {
  period: number;
  targets: SnapTarget[];
};

export const VECTOR_CONTROL_CONFIG = {
  gridRotation: {
    period: 90,
    targets: [
      { value: 0, strength: 1 },
      { value: 30, strength: 1 },
      { value: 45, strength: 1 },
      { value: 60, strength: 1 },
    ],
  } satisfies PeriodicSnapConfig,
  gridScale: {
    min: 0.5,
    max: 2,
    magnitudeMultiplier: 2,
    analogStart: 1,
    targets: [
      { value: 0.5, strength: 0.125 },
      { value: 0.75, strength: 0.125 },
      { value: 1, strength: 0.125 },
    ] satisfies SnapTarget[],
  },
} as const;

export function snapLinear(value: number, targets: readonly SnapTarget[]): number {
  let result = value;
  let closestNormalizedDistance = Number.POSITIVE_INFINITY;

  for (const target of targets) {
    if (target.strength < 0) continue;
    const distance = Math.abs(value - target.value);
    if (distance > target.strength) continue;
    const normalizedDistance = target.strength === 0
      ? (distance === 0 ? 0 : Number.POSITIVE_INFINITY)
      : distance / target.strength;
    if (normalizedDistance < closestNormalizedDistance) {
      closestNormalizedDistance = normalizedDistance;
      result = target.value;
    }
  }

  return result;
}

export function snapPeriodic(value: number, config: PeriodicSnapConfig): number {
  if (config.period <= 0) return value;

  let result = value;
  let closestNormalizedDistance = Number.POSITIVE_INFINITY;

  for (const target of config.targets) {
    if (target.strength < 0) continue;
    const cycle = Math.round((value - target.value) / config.period);
    const candidate = target.value + cycle * config.period;
    const distance = Math.abs(value - candidate);
    if (distance > target.strength) continue;
    const normalizedDistance = target.strength === 0
      ? (distance === 0 ? 0 : Number.POSITIVE_INFINITY)
      : distance / target.strength;
    if (normalizedDistance < closestNormalizedDistance) {
      closestNormalizedDistance = normalizedDistance;
      result = candidate;
    }
  }

  return result;
}
