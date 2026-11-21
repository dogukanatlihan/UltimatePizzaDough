import type { DoughCalculatorInputs, PrefermentType, YeastType } from '../types';
import { PIZZA_STYLES, calculateDoughBallWeight } from './doughCalculator';
import { RANGES, clamp, storedSizeBounds, yeastRange } from './ranges';

// Raise the version whenever a style preset or a conversion changes: a saved recipe carries the old numbers,
// and a returning visitor would keep them without knowing. Older records are then ignored and removed.
export const STORAGE_KEY = 'mbp.recipe.v2';
const OLD_KEYS = ['mbp.recipe.v1'];

const YEAST_TYPES: readonly string[] = ['active_dry', 'instant', 'fresh'] satisfies YeastType[];
const PREFERMENT_TYPES: readonly string[] = ['none', 'poolish', 'biga', 'sponge', 'sourdough'] satisfies PrefermentType[];

/**
 * Turns what is in storage back into calculator inputs, or null when it cannot be trusted.
 * Wrong types and unknown names drop the record; numbers out of range are clamped.
 */
export const parseSavedInputs = (raw: string | null): DoughCalculatorInputs | null => {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
  const r = data as Record<string, unknown>;
  const pref = r.preferment as Record<string, unknown> | null | undefined;

  const style = PIZZA_STYLES.find((s) => s.id === r.pizzaStyle);
  if (!style) return null;
  if (typeof r.yeastType !== 'string' || !YEAST_TYPES.includes(r.yeastType)) return null;
  if (typeof pref !== 'object' || pref === null || typeof pref.type !== 'string' || !PREFERMENT_TYPES.includes(pref.type)) return null;
  if (typeof r.useInches !== 'boolean' || typeof r.isRectangular !== 'boolean') return null;

  let ok = true;
  const num = (value: unknown, [min, max]: readonly [number, number, ...number[]]): number => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      ok = false;
      return min;
    }
    return clamp(value, min, max);
  };
  const size = storedSizeBounds(r.useInches);
  const inputs: DoughCalculatorInputs = {
    numberOfPizzas: Math.round(num(r.numberOfPizzas, RANGES.numberOfPizzas)),
    ballWeight: num(r.ballWeight, [1, 20000]),
    pizzaStyle: r.pizzaStyle as string,
    hydration: num(r.hydration, RANGES.hydration),
    salt: num(r.salt, RANGES.salt),
    yeast: num(r.yeast, yeastRange(r.yeastType as YeastType)),
    yeastType: r.yeastType as YeastType,
    oil: num(r.oil, RANGES.oil),
    sugar: num(r.sugar, RANGES.sugar),
    diastaticMalt: num(r.diastaticMalt, RANGES.diastaticMalt),
    doughEnhancer: num(r.doughEnhancer, RANGES.doughEnhancer),
    thicknessFactor: num(r.thicknessFactor, RANGES.thicknessFactor),
    pizzaDiameter: num(r.pizzaDiameter, size.diameter),
    panWidth: num(r.panWidth, size.pan),
    panLength: num(r.panLength, size.pan),
    preferment: {
      type: pref.type as PrefermentType,
      percentage: num(pref.percentage, [0, RANGES.prefermentPercentage[1]]), // "none" stores 0
      hydration: num(pref.hydration, RANGES.prefermentHydration),
    },
    useInches: r.useInches,
    // The shape follows the style; only a style that allows both keeps the saved choice.
    isRectangular: style.isRectangular === 'both' ? r.isRectangular : style.isRectangular === true,
  };
  // The ball weight is a result, not an input: work it out again so it always fits the sizes above.
  inputs.ballWeight = inputs.isRectangular
    ? calculateDoughBallWeight(inputs.pizzaStyle, 0, inputs.panWidth, inputs.panLength, inputs.thicknessFactor, inputs.useInches)
    : calculateDoughBallWeight(inputs.pizzaStyle, inputs.pizzaDiameter, undefined, undefined, inputs.thicknessFactor, inputs.useInches);
  return ok ? inputs : null;
};

/** True when two recipes are the same recipe (field by field, whatever object they live in). */
export const sameInputs = (a: DoughCalculatorInputs, b: DoughCalculatorInputs): boolean =>
  JSON.stringify(parseSavedInputs(JSON.stringify(a))) === JSON.stringify(parseSavedInputs(JSON.stringify(b)));

// Storage throws in private windows and when full. The app works without memory then.
const safeStorage = (): Storage | undefined => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

export const loadSavedInputs = (storage: Pick<Storage, 'getItem'> | undefined = safeStorage()): DoughCalculatorInputs | null => {
  try {
    return parseSavedInputs(storage?.getItem(STORAGE_KEY) ?? null);
  } catch {
    return null;
  }
};

export const saveInputs = (inputs: DoughCalculatorInputs, storage: Pick<Storage, 'setItem'> | undefined = safeStorage()): void => {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(inputs));
    for (const key of OLD_KEYS) (storage as Partial<Storage> | undefined)?.removeItem?.(key);
  } catch {
    // nothing to do: the recipe just is not remembered
  }
};

export const clearSavedInputs = (storage: Pick<Storage, 'removeItem'> | undefined = safeStorage()): void => {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // same as above
  }
};
