import { PIZZA_STYLES } from './doughCalculator';

export type Range = readonly [min: number, max: number, step: number];

// One source for every slider and for checking a saved recipe.
export const RANGES = {
  numberOfPizzas: [1, 20, 1],
  thicknessFactor: [0.03, 0.15, 0.01],
  hydration: [50, 85, 1],
  salt: [1, 4, 0.1],
  yeast: [0, 2, 0.01],
  yeastFresh: [0, 6, 0.01], // fresh yeast needs about 3x the dry amount
  oil: [0, 10, 0.5],
  sugar: [0, 5, 0.5],
  diastaticMalt: [0, 2, 0.1],
  doughEnhancer: [0, 2, 0.1],
  prefermentPercentage: [10, 100, 5],
  prefermentHydration: [50, 125, 5],
} as const satisfies Record<string, Range>;

// Sizes are kept in the unit on screen, so the bounds depend on it: 15–60cm ≈ 6–24″, 10–60cm ≈ 4–24″.
export const sizeBounds = (useInches: boolean) =>
  useInches
    ? ({ diameter: [6, 24], pan: [4, 24] } as const)
    : ({ diameter: [15, 60], pan: [10, 60] } as const);

// A home batch: four round pizzas, or one pan.
export const usualBatch = (styleId: string): number =>
  PIZZA_STYLES.find((s) => s.id === styleId)?.isRectangular ? 1 : 4;

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
