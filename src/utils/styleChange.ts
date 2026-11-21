// What a style change and a preferment choice load. Pure, so the checks can run it without React.
import type { DoughCalculatorInputs, PrefermentType, YeastType } from '../types';
import { PIZZA_STYLES, ballWeightOf, convertYeastPercent, styleSize } from './doughCalculator';

// Every yeast % in the presets is an instant-yeast amount. The slider % means the yeast type that is
// selected, so presets pass through fromInstant() before they reach the inputs.
export const fromInstant = (percent: number, to: YeastType) => convertYeastPercent(percent, 'instant', to);

// Style-specific preferment defaults.
// "percentage" = % of total flour that goes into the preferment.
// At 100%, all flour is in the preferment and only water/salt/extras are added later.
// Traditional ranges: poolish 30-50%, biga 40-60%, sponge 50-75%, sourdough 20-35%.
// Sponge: 60% water and 0.5% instant yeast (BAKERpedia: 58-65% water, compressed yeast from 1.5% of the flour, 2-8 h).
const PREFERMENT_DEFAULTS: Record<string, Record<string, { percentage: number; hydration: number; yeast: number }>> = {
  neapolitan: {
    // Neapolitan: moderate preferment to preserve delicate flavor
    poolish: { percentage: 40, hydration: 100, yeast: 0.05 },
    biga:    { percentage: 50, hydration: 60, yeast: 0.05 },
    sponge:  { percentage: 50, hydration: 60, yeast: 0.5 },
    sourdough: { percentage: 25, hydration: 100, yeast: 0 },
  },
  ny: {
    // NY: poolish or sponge for flavor complexity in a chewy crust
    poolish: { percentage: 40, hydration: 100, yeast: 0.3 },
    biga:    { percentage: 50, hydration: 60, yeast: 0.3 },
    sponge:  { percentage: 60, hydration: 60, yeast: 0.5 },
    sourdough: { percentage: 30, hydration: 100, yeast: 0 },
  },
  sicilian: {
    // Sicilian: higher preferment % for lighter, airier thick crust
    poolish: { percentage: 50, hydration: 100, yeast: 0.3 },
    biga:    { percentage: 50, hydration: 60, yeast: 0.3 },
    sponge:  { percentage: 65, hydration: 60, yeast: 0.5 },
    sourdough: { percentage: 30, hydration: 100, yeast: 0 },
  },
  detroit: {
    // Detroit: similar to Sicilian, open crumb structure
    poolish: { percentage: 45, hydration: 100, yeast: 0.3 },
    biga:    { percentage: 50, hydration: 60, yeast: 0.3 },
    sponge:  { percentage: 60, hydration: 60, yeast: 0.5 },
    sourdough: { percentage: 25, hydration: 100, yeast: 0 },
  },
  pan: {
    // Pan pizza: moderate preferment to complement the buttery, enriched dough
    poolish:   { percentage: 45, hydration: 100, yeast: 0.3 },
    biga:      { percentage: 50, hydration: 60, yeast: 0.3 },
    sponge:    { percentage: 60, hydration: 60, yeast: 0.5 },
    sourdough: { percentage: 25, hydration: 100, yeast: 0 },
  },
  focaccia: {
    // Focaccia: high preferment for maximum flavor and open crumb
    poolish: { percentage: 50, hydration: 100, yeast: 0.3 },
    biga:    { percentage: 60, hydration: 60, yeast: 0.25 },
    sponge:  { percentage: 65, hydration: 60, yeast: 0.5 },
    sourdough: { percentage: 30, hydration: 100, yeast: 0 },
  },
};

export const prefermentDefaults = (styleId: string, type: PrefermentType) => PREFERMENT_DEFAULTS[styleId]?.[type] ?? null;

/** The recipe after a change of style: the style's size, thickness and percentages, with the user's units and yeast type. */
export const applyStyle = (prev: DoughCalculatorInputs, styleId: string, numberOfPizzas: number): DoughCalculatorInputs => {
  const style = PIZZA_STYLES.find((s) => s.id === styleId);
  if (!style) return prev;
  // The style's trade size in the unit on screen (an 18-inch New York pie is 18, not 17.7).
  const size = styleSize(styleId, prev.useInches);
  const isRectangular = style.isRectangular === true || style.isRectangular === 'both';
  // A preferment that is on stays on, with this style's amounts for it. Keeping the old share with the new
  // style's straight-dough yeast put instant yeast into a sourdough and starved a sponge.
  const pref = prefermentDefaults(styleId, prev.preferment.type);
  return {
    ...prev,
    pizzaStyle: styleId,
    hydration: style.defaultHydration,
    thicknessFactor: style.defaultThicknessFactor,
    ballWeight: ballWeightOf({ pizzaStyle: styleId, ...size, pizzaDiameter: size.diameter, thicknessFactor: style.defaultThicknessFactor, useInches: prev.useInches, isRectangular }),
    isRectangular,
    pizzaDiameter: size.diameter,
    panWidth: size.panWidth,
    panLength: size.panLength,
    numberOfPizzas,
    ...style.preset,
    yeast: fromInstant(pref ? pref.yeast : style.preset.yeast, prev.yeastType),
    preferment: pref ? { type: prev.preferment.type, percentage: pref.percentage, hydration: pref.hydration } : prev.preferment,
    // No cited formula for these styles adds malt or an enhancer; the sliders stay for flour that needs them.
    diastaticMalt: 0,
    doughEnhancer: 0,
  };
};
