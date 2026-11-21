// Accuracy checks: every default the app proposes must sit inside what the cited sources give.
// Sources: AVPN Disciplinare 2024; EU Reg. 97/2010; T. Lehmann (pizzamaking.com, PMQ); J. Hamelman / King Arthur Pro
// (yeast, preferments); Modernist Pizza, K. López-Alt, S. Randazzo (Detroit); T. Gemignani, King Arthur, ATK (Sicilian);
// S. Nosrat, King Arthur (focaccia); BAKERpedia (sponge).
import assert from 'node:assert/strict';
import { calculateDoughRecipe, calculateDoughBallWeight, convertYeastPercent, PIZZA_STYLES, styleSize } from './doughCalculator';
import { RANGES, yeastRange } from './ranges';
import { STORAGE_KEY, loadSavedInputs } from './savedRecipe';
import { translate } from '../context/translations';
import { methodStages, bakeInfo } from '../design/recipeText';
import { BAKE_TIME } from '../design/styleMeta';
import { ouncesNumber } from './format';
import type { DoughCalculatorInputs, PrefermentType } from '../types';

const tEn = (key: string, vars?: Record<string, string | number>) => translate('en', key, vars);
const tTr = (key: string, vars?: Record<string, string | number>) => translate('tr', key, vars);
const style = (id: string) => PIZZA_STYLES.find((s) => s.id === id)!;
const inside = (what: string, value: number, [min, max]: readonly [number, number]) =>
  assert.ok(value >= min && value <= max, `${what}: ${value} is outside ${min}–${max}`);

// ---- Yeast types: fresh 1 : active dry 0.4 : instant 1/3 (Hamelman, King Arthur Pro; AVPN: dry = 1/3 of fresh)
assert.equal(convertYeastPercent(0.1, 'instant', 'fresh'), 0.3);
assert.equal(convertYeastPercent(1, 'fresh', 'active_dry'), 0.4);
assert.equal(convertYeastPercent(0.5, 'instant', 'active_dry'), 0.6);
// The largest instant amount still fits on the slider after a switch to another yeast type.
for (const type of ['active_dry', 'fresh'] as const) assert.ok(yeastRange(type)[1] >= convertYeastPercent(yeastRange('instant')[1], 'instant', type));

// ---- Style presets, in baker's % (yeast as instant dry). [hydration, salt, yeast, oil, sugar]
const SOURCED: Record<string, { hydration: [number, number]; salt: [number, number]; yeast: [number, number]; oil: [number, number]; sugar: [number, number]; ball: [number, number] }> = {
  // AVPN: water 55.6–62.5%, salt 2.2–3.75%, dry yeast 0.002–0.06%, no fat or sugar, ball 200–280 g.
  neapolitan: { hydration: [55.6, 62.5], salt: [2.2, 3.75], yeast: [0.002, 0.06], oil: [0, 0], sugar: [0, 0], ball: [200, 280] },
  // Lehmann: water 58–65%, salt 1.5–1.75% in his recipes, IDY 0.17–0.5%, oil 1–2%, sugar 0–2%; 18" ball 635–721 g.
  ny: { hydration: [58, 65], salt: [1.5, 2], yeast: [0.17, 0.5], oil: [1, 2], sugar: [0, 2], ball: [635, 721] },
  // Gemignani, King Arthur, ATK: water 57–73.5%, salt 2.0–2.22%, IDY 0.46–1.1%, oil 0–6.1%, sugar 0–0.8%; 12x18" 920–990 g.
  sicilian: { hydration: [57, 73.5], salt: [2, 2.22], yeast: [0.46, 1.1], oil: [0, 6.1], sugar: [0, 0.8], ball: [920, 990] },
  // Modernist Pizza, López-Alt, Randazzo, Arena: water 64.6–80%, salt 1.03–3%, IDY 0.5–1.67%, oil 0–2% in most, sugar 0–1.5%; 10x14" 495–535 g.
  detroit: { hydration: [64.6, 80], salt: [1.03, 3], yeast: [0.5, 1.67], oil: [0, 2], sugar: [0, 1.5], ball: [495, 535] },
  // López-Alt, King Arthur: water 68.75–70.8%, salt 1.9–2.5%, IDY 0.6–1%, oil 2–5.4%, no sugar; Lehmann: 12–16 oz for a 12" pan.
  pan: { hydration: [68, 70.8], salt: [1.9, 2.5], yeast: [0.6, 1], oil: [2, 5.4], sugar: [0, 0], ball: [329, 441] },
  // Nosrat, King Arthur (high-hydration pan focaccia): water 75–80%, salt 1.25–2.5%, IDY 0.4–0.83%, oil 5–6.25%, sugar 0–1.9%; 9x13" 650–700 g.
  focaccia: { hydration: [75, 80], salt: [1.25, 2.5], yeast: [0.4, 0.83], oil: [5, 6.25], sugar: [0, 1.9], ball: [650, 700] },
};
assert.deepEqual(PIZZA_STYLES.map((s) => s.id).sort(), Object.keys(SOURCED).sort());
for (const s of PIZZA_STYLES) {
  const src = SOURCED[s.id];
  inside(`${s.id} hydration`, s.defaultHydration, src.hydration);
  inside(`${s.id} salt`, s.preset.salt, src.salt);
  inside(`${s.id} yeast`, s.preset.yeast, src.yeast);
  inside(`${s.id} oil`, s.preset.oil, src.oil);
  inside(`${s.id} sugar`, s.preset.sugar, src.sugar);
  inside(`${s.id} thickness on the slider`, s.defaultThicknessFactor, [RANGES.thicknessFactor[0], RANGES.thicknessFactor[1]]);
  const size = styleSize(s.id, false);
  const ball = s.isRectangular
    ? calculateDoughBallWeight(s.id, 0, size.panWidth, size.panLength, s.defaultThicknessFactor)
    : calculateDoughBallWeight(s.id, size.diameter, undefined, undefined, s.defaultThicknessFactor);
  inside(`${s.id} dough weight`, ball, src.ball);
}
// The slider reaches every sourced thickness: 0.06 (cracker-thin) to 0.30 (King Arthur focaccia).
assert.ok(RANGES.thicknessFactor[0] <= 0.06 && RANGES.thicknessFactor[1] >= 0.3);

// Sizes: the trade sizes in each unit (an 18-inch New York pie is 18, not 17.7).
assert.deepEqual(styleSize('ny', true), { diameter: 18, panWidth: 12, panLength: 16 });
assert.equal(styleSize('ny', false).diameter, 45);
assert.deepEqual([styleSize('detroit', true).panWidth, styleSize('detroit', true).panLength], [10, 14]);
assert.deepEqual([styleSize('sicilian', true).panWidth, styleSize('sicilian', true).panLength], [12, 18]);
assert.deepEqual([styleSize('focaccia', true).panWidth, styleSize('focaccia', true).panLength], [9, 13]);

// ---- Preferments
const inputsFor = (id: string, over: Partial<DoughCalculatorInputs> = {}): DoughCalculatorInputs => {
  const s = style(id);
  const size = styleSize(id, false);
  return {
    numberOfPizzas: 2, ballWeight: 500, pizzaStyle: id, hydration: s.defaultHydration, ...s.preset, yeastType: 'instant',
    diastaticMalt: 0, doughEnhancer: 0, thicknessFactor: s.defaultThicknessFactor, pizzaDiameter: size.diameter,
    panWidth: size.panWidth, panLength: size.panLength, preferment: { type: 'none', percentage: 0, hydration: 100 },
    useInches: false, isRectangular: Boolean(s.isRectangular), ...over,
  };
};
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} !== ${b}`);
const withPreferment = (type: PrefermentType, over: Partial<DoughCalculatorInputs> = {}) =>
  calculateDoughRecipe(inputsFor('ny', { yeast: 0.3, preferment: { type, percentage: 40, hydration: 100 }, ...over }));
// Poolish and biga: 0.1% instant yeast on the preferment's own flour (King Arthur Pro; Modernist Bread, 12 h).
for (const type of ['poolish', 'biga'] as const) {
  const r = withPreferment(type);
  near(r.preferment!.yeast!, r.preferment!.flour * 0.001);
}
// The same preferment with fresh yeast takes three times the weight.
{
  const r = withPreferment('poolish', { yeastType: 'fresh', yeast: 0.9 });
  near(r.preferment!.yeast!, r.preferment!.flour * 0.003);
}
// Sponge and dough: all the yeast goes into the sponge (BAKERpedia).
{
  const r = withPreferment('sponge', { yeast: 0.5 });
  near(r.preferment!.yeast!, r.totalFlour * 0.005);
  near(r.mainDough!.yeast, 0);
}

// ---- Method: what each style's sources prescribe
const method = (id: string, t = tEn) => methodStages(calculateDoughRecipe(inputsFor(id)), t, 'en', id).flatMap((stage) => stage.steps).join('\n');
// Neapolitan (AVPN, EU): direct method, proofed at room temperature. No autolyse, no folds, no refrigerator.
assert.ok(!/autolyse|stretch and fold|refrigerat/i.test(method('neapolitan')), method('neapolitan'));
assert.ok(/4.6 hours/.test(method('neapolitan')));
assert.ok(!/otoliz|buzdolab/i.test(method('neapolitan', tTr)));
// New York (Lehmann): balled straight after mixing, then cold. No bulk rise at room temperature.
assert.ok(!/bulk ferment/i.test(method('ny')), method('ny'));
assert.ok(/refrigerat/i.test(method('ny')));
// Pan styles: one piece per pan, proofed in the oiled pan.
for (const id of ['sicilian', 'detroit', 'pan', 'focaccia']) {
  assert.ok(/rise in the pan/i.test(method(id)), `${id}: no pan proof\n${method(id)}`);
  assert.ok(!/individual balls/i.test(method(id)), id);
  assert.ok(!/stretch the dough to your desired size/i.test(bakeInfo(id, tEn).steps.join('\n')), id);
}
// Every step is filled in and present in both languages.
for (const s of PIZZA_STYLES) for (const t of [tEn, tTr]) {
  for (const step of [...method(s.id, t).split('\n'), ...bakeInfo(s.id, t).steps]) assert.ok(step && !/[{}]|^[a-zA-Z]+\.[\w.]+$/.test(step), `${s.id}: ${step}`);
}

// ---- Baking: the card and the step text give the same figures
const digits = (text: string) => text.replace(/[–-]/g, '-');
for (const s of PIZZA_STYLES) {
  const bake = bakeInfo(s.id, tEn);
  const time = BAKE_TIME[s.id];
  assert.ok(digits(bake.steps[3]).includes(`${time.from}-${time.to}`), `${s.id}: card says ${bake.time}, step says "${bake.steps[3]}"`);
  const fahrenheit = bake.temp.match(/(\d+)°F/)![1];
  assert.ok(bake.steps[0].includes(fahrenheit), `${s.id}: card says ${bake.temp}, step says "${bake.steps[0]}"`);
}
// Neapolitan oven: AVPN and EU give 430–485 °C, not 500.
assert.ok(!bakeInfo('neapolitan', tEn).temp.includes('500°C'));

// A pinch of yeast never reads as 0 oz (0.08 g is 0.003 oz).
assert.equal(ouncesNumber(0.08), '0.003');
assert.equal(ouncesNumber(7.2), '0.25');

// ---- Saved recipes from before these corrections are dropped, so regulars get the corrected numbers.
assert.notEqual(STORAGE_KEY, 'mbp.recipe.v1');
{
  const old = JSON.stringify(inputsFor('ny'));
  assert.equal(loadSavedInputs({ getItem: (key: string) => (key === 'mbp.recipe.v1' ? old : null) }), null);
}

console.log('accuracy checks passed');
