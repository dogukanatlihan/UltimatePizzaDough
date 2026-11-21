// Assert-based self-checks for the rules around the dough maths. Run with `npm test`.
import assert from 'node:assert/strict';
import type { DoughCalculatorInputs } from '../types';
import { sizeBounds, usualBatch } from './ranges';
import { formatGrams, formatOunces } from './format';
import { parseSavedInputs, loadSavedInputs, saveInputs, clearSavedInputs } from './savedRecipe';
import { translations } from '../context/translations';

// ---- Weights read like a kitchen scale
assert.equal(formatGrams(457.3), '457 g');
assert.equal(formatGrams(9.74), '9.7 g');
assert.equal(formatGrams(0.234), '0.23 g');
assert.equal(formatGrams(5.2, { yeast: true }), '5.2 g');
assert.equal(formatGrams(12.345, { yeast: true }), '12.35 g');
assert.equal(formatGrams(-113.5), '-114 g');
assert.equal(formatGrams(-0.001), '0 g'); // never "-0"
assert.equal(formatGrams(NaN), '0 g');
assert.equal(formatGrams(Infinity), '0 g');
assert.equal(formatGrams(0.234, { locale: 'tr' }), '0,23 g');
assert.equal(formatOunces(457.3), '16.1 oz');
assert.equal(formatOunces(13), '0.46 oz');

// ---- Usual batch and size bounds
assert.equal(usualBatch('neapolitan'), 4);
assert.equal(usualBatch('detroit'), 1);
assert.equal(usualBatch('focaccia'), 1);
assert.deepEqual(sizeBounds(true).diameter, [6, 24]);
assert.deepEqual(sizeBounds(false).pan, [10, 60]);

// ---- Saved recipe
const good: DoughCalculatorInputs = {
  numberOfPizzas: 6, ballWeight: 558, pizzaStyle: 'ny', hydration: 65, salt: 2.25, yeast: 0.4, yeastType: 'instant',
  oil: 2, sugar: 1.5, diastaticMalt: 0.75, doughEnhancer: 0.4, thicknessFactor: 0.08, pizzaDiameter: 45, panWidth: 30, panLength: 40,
  preferment: { type: 'none', percentage: 0, hydration: 100 }, useInches: false, isRectangular: false,
};
assert.deepEqual(parseSavedInputs(JSON.stringify(good)), good);

// Broken, old or hand-edited records are dropped, never thrown on.
for (const bad of [
  null, '', '{', '[]', '"x"',
  JSON.stringify({ ...good, pizzaStyle: 'calzone' }),
  JSON.stringify({ ...good, hydration: 'wet' }),
  JSON.stringify({ ...good, yeastType: 'wild' }),
  JSON.stringify({ ...good, preferment: { type: 'levain', percentage: 30, hydration: 100 } }),
  JSON.stringify({ ...good, salt: null }),
  JSON.stringify({ hydration: 60 }),
]) assert.equal(parseSavedInputs(bad), null, `should drop ${bad}`);

// Out-of-range numbers are clamped, not discarded.
assert.equal(parseSavedInputs(JSON.stringify({ ...good, hydration: 400 }))!.hydration, 85);
assert.equal(parseSavedInputs(JSON.stringify({ ...good, numberOfPizzas: 0 }))!.numberOfPizzas, 1);

// A record saved in inches is checked against the inch bounds.
const inches = { ...good, useInches: true, pizzaDiameter: 17.7 };
assert.equal(parseSavedInputs(JSON.stringify(inches))!.pizzaDiameter, 17.7);
assert.equal(parseSavedInputs(JSON.stringify({ ...inches, pizzaDiameter: 45 }))!.pizzaDiameter, 24);

// Fresh yeast has the wider range.
assert.equal(parseSavedInputs(JSON.stringify({ ...good, yeastType: 'fresh', yeast: 4 }))!.yeast, 4);
assert.equal(parseSavedInputs(JSON.stringify({ ...good, yeast: 4 }))!.yeast, 2);

// Unknown fields do not come back.
assert.equal('evil' in parseSavedInputs(JSON.stringify({ ...good, evil: 1 }))!, false);

// Storage that throws (private window, quota) never breaks the app.
const broken = {
  getItem(): string | null { throw new Error('denied'); },
  setItem(): void { throw new Error('quota'); },
  removeItem(): void { throw new Error('denied'); },
};
assert.equal(loadSavedInputs(broken), null);
assert.doesNotThrow(() => saveInputs(good, broken));
assert.doesNotThrow(() => clearSavedInputs(broken));

// Round trip through a working store.
const mem = new Map<string, string>();
const store = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
saveInputs(good, store);
assert.deepEqual(loadSavedInputs(store), good);
clearSavedInputs(store);
assert.equal(loadSavedInputs(store), null);

// ---- Strings: every key the screens use exists in both languages with the same placeholders
const NEW_KEYS = `nav.steps step.style step.size step.recipe step.of s1.title
  style.neapolitan.short style.ny.short style.sicilian.short style.detroit.short style.pan.short style.focaccia.short
  s2.title chip.change size.pizzas size.diameter size.panWidth size.panLength size.shape size.rectPan size.measureIn
  crust.label crust.thin crust.medium crust.thick crust.extraThick crust.ball a11y.less a11y.more
  s3.title recipe.totalDough stage.dayBefore stage.bakingDay water.label water.firmer water.wetter
  water.feel.firm water.feel.classic water.feel.soft water.feel.wet tune.title tune.sub form.doughEnhancer form.sponge form.sourdough
  pref.sub.none pref.sub.on pref.type pref.share pref.water pref.hint pref.flourWater method.one method.two
  bake.title bake.oven bake.time bake.flour unit.min unit.sec action.copy action.copied action.print copy.hydration
  bar.next bar.see bar.back bar.dough bar.flour bar.water footer.startOver toast.startedOver toast.undo
  a2hs.button a2hs.ios theme.toLight theme.toDark lang.toTurkish lang.toEnglish`.split(/\s+/);
for (const key of NEW_KEYS) assert.ok(translations[key], `missing string: ${key}`);
const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join();
for (const [key, pair] of Object.entries(translations)) {
  assert.ok(pair.en.trim() && pair.tr.trim(), `empty string: ${key}`);
  assert.equal(placeholders(pair.en), placeholders(pair.tr), `placeholders differ: ${key}`);
}

console.log('rules checks passed');
