// Assert-based self-check for the dough maths. Run with `npm test`.
import assert from 'node:assert/strict';
import { calculateDoughRecipe, calculateDoughBallWeight, convertYeastPercent, PIZZA_STYLES, cmToInches, inchesToCm } from './doughCalculator';
import type { DoughCalculatorInputs, PrefermentConfig } from '../types';

const base: DoughCalculatorInputs = {
  numberOfPizzas: 4,
  ballWeight: 250,
  pizzaStyle: 'neapolitan',
  hydration: 60,
  salt: 2.8,
  yeast: 0.05,
  yeastType: 'instant',
  oil: 0,
  sugar: 0,
  diastaticMalt: 0,
  doughEnhancer: 0,
  thicknessFactor: 0.06,
  pizzaDiameter: 30,
  panWidth: 30,
  panLength: 40,
  preferment: { type: 'none', percentage: 0, hydration: 100 },
  useInches: false,
  isRectangular: false,
};

const run = (preferment: PrefermentConfig, overrides: Partial<DoughCalculatorInputs> = {}) => {
  const recipe = calculateDoughRecipe({ ...base, ...overrides, preferment });
  const totalYeast = recipe.ingredients.find((i) => i.name.includes('Yeast'))!.weight;
  return { recipe, totalYeast };
};
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} !== ${b}`);

// Ingredients always add up to the requested dough weight.
near(run(base.preferment).recipe.ingredients.reduce((s, i) => s + i.weight, 0), 4 * 250);

// Low-yeast style + poolish: the preferment must not take more yeast than the recipe has.
{
  const { recipe, totalYeast } = run({ type: 'poolish', percentage: 40, hydration: 100 });
  assert.ok(recipe.mainDough!.yeast >= 0);
  near(recipe.preferment!.yeast! + recipe.mainDough!.yeast, totalYeast);
}

// Enough yeast: the preferment keeps its 0.1%-of-flour share (instant = x0.75), the rest goes to the main dough.
{
  const { recipe, totalYeast } = run({ type: 'poolish', percentage: 40, hydration: 100 }, { yeast: 0.3 });
  near(recipe.preferment!.yeast!, recipe.totalFlour * 0.001 * 0.75);
  near(recipe.preferment!.yeast! + recipe.mainDough!.yeast, totalYeast);
}

// Sourdough: no commercial yeast in the starter, so any yeast the user adds stays in the main dough.
{
  const { recipe, totalYeast } = run({ type: 'sourdough', percentage: 25, hydration: 100 }, { yeast: 0.2 });
  assert.equal(recipe.preferment!.yeast, undefined);
  near(recipe.mainDough!.yeast, totalYeast);
}

// Flour and water split across the two stages without loss.
{
  const { recipe } = run({ type: 'biga', percentage: 50, hydration: 60 });
  near(recipe.preferment!.flour + recipe.mainDough!.flour, recipe.totalFlour);
  near(recipe.preferment!.water + recipe.mainDough!.water, recipe.totalFlour * 0.6);
}

// The yeast % is the selected yeast type: what the slider says is what gets weighed.
{
  const { recipe, totalYeast } = run(base.preferment, { yeast: 0.4, yeastType: 'fresh' });
  near(totalYeast, recipe.totalFlour * 0.004);
}

// Switching yeast type keeps the leavening power (instant 0.75 : active dry 1 : fresh 3).
assert.equal(convertYeastPercent(0.3, 'instant', 'active_dry'), 0.4);
assert.equal(convertYeastPercent(0.3, 'instant', 'fresh'), 1.2);
assert.equal(convertYeastPercent(0.2, 'fresh', 'instant'), 0.05);

// Neapolitan preset: a 30 cm pizza gets a ball inside the AVPN range (200-280 g).
{
  const tf = PIZZA_STYLES.find((s) => s.id === 'neapolitan')!.defaultThicknessFactor;
  const ball = calculateDoughBallWeight('neapolitan', 30, undefined, undefined, tf);
  assert.ok(ball >= 200 && ball <= 280, `neapolitan ball ${ball} g`);
}

// Lengths convert exactly: switching units and back must give the same pizza.
for (const cm of [15, 23, 25, 30, 33, 36, 45, 46, 60]) near(inchesToCm(cmToInches(cm)), cm);
near(cmToInches(2.54), 1);

// Ball weight is thickness x area with no rounding on the way (only the final gram).
{
  const OZ = 28.349523125;
  const round = (d: number, tf: number) => Math.round(tf * Math.PI * (d / 2.54 / 2) ** 2 * OZ);
  const rect = (w: number, l: number, tf: number) => Math.round(tf * (w / 2.54) * (l / 2.54) * OZ);
  assert.equal(calculateDoughBallWeight('ny', 45, undefined, undefined, 0.08), round(45, 0.08));
  assert.equal(calculateDoughBallWeight('focaccia', 0, 23, 33, 0.14), rect(23, 33, 0.14));
  assert.equal(calculateDoughBallWeight('detroit', 0, 25, 36, 0.1), rect(25, 36, 0.1));
  // The same pizza in inches or in centimetres weighs the same.
  assert.equal(calculateDoughBallWeight('ny', 18, undefined, undefined, 0.08, true), calculateDoughBallWeight('ny', 45.72, undefined, undefined, 0.08, false));
}

console.log('doughCalculator checks passed');
