// Assert-based self-checks for the rules around the dough maths. Run with `npm test`.
import assert from 'node:assert/strict';
import type { DoughCalculatorInputs } from '../types';
import { sizeBounds, usualBatch } from './ranges';
import { formatGrams, formatOunces } from './format';
import { parseSavedInputs, loadSavedInputs, saveInputs, clearSavedInputs } from './savedRecipe';
import { translations, translate } from '../context/translations';
import { calculateDoughRecipe } from './doughCalculator';
import { gramsNumber, formatPercent } from './format';
import { methodStages, bakeInfo, copyText, sizeText } from '../design/recipeText';
import { runTransition } from '../design/motion';

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

// ---- Percent: English writes 60%, Turkish writes %60
assert.equal(formatPercent(60), '60%');
assert.equal(formatPercent(2.25, 'tr'), '%2,25');
assert.equal(formatPercent(0.05), '0.05%');

// ---- Recipe in words: one formatter for the card, the method and the copied text
const tEn = (key: string, vars?: Record<string, string | number>) => translate('en', key, vars);
const tTr = (key: string, vars?: Record<string, string | number>) => translate('tr', key, vars);
const ny = { ...good, numberOfPizzas: 4 };
const nyPoolish = { ...ny, yeast: 0.3, preferment: { type: 'poolish' as const, percentage: 40, hydration: 100 } };
{
  const rec = calculateDoughRecipe(nyPoolish);
  for (const [t, locale] of [[tEn, 'en'], [tTr, 'tr']] as const) {
    const stages = methodStages(rec, t, locale);
    assert.equal(stages.length, 2);
    for (const stage of stages) {
      assert.ok(stage.title && stage.time);
      for (const step of stage.steps) assert.ok(!step.includes('{'), `unfilled placeholder: ${step}`);
    }
  }
  // The method states the same flour weight the card shows.
  assert.ok(methodStages(rec, tEn, 'en')[1].steps[1].includes(`${gramsNumber(rec.mainDough!.flour)}g`));
  assert.ok(copyText(rec, nyPoolish, tEn, 'en').includes('Poolish'));
}
{
  const rec = calculateDoughRecipe(ny);
  assert.equal(methodStages(rec, tEn, 'en').length, 1);
  const lines = copyText(rec, ny, tEn, 'en').split('\n');
  assert.equal(lines[0], 'New York — 4 × 558 g (45 cm)');
  assert.equal(lines[1], 'Hydration 65%');
  assert.ok(lines.includes(`• Flour: ${gramsNumber(rec.totalFlour)} g (100%)`));
}
assert.equal(sizeText(ny, 'en'), '45 cm');
assert.equal(sizeText({ ...ny, useInches: true, pizzaDiameter: 17.7 }, 'en'), '17.7″');
assert.equal(sizeText({ ...ny, isRectangular: true, panWidth: 25, panLength: 36 }, 'tr'), '25 × 36 cm');
{
  const bake = bakeInfo('neapolitan', tEn);
  assert.equal(bake.time, '60–90 s');
  assert.equal(bake.temp, '500°C / 932°F');
  assert.equal(bake.steps.length, 4);
  assert.ok(bake.flour);
  assert.equal(bakeInfo('ny', tTr).time, '8–10 dk');
}

// ---- Step transitions: the update runs exactly once on every path
{
  const calls: string[] = [];
  const el = { dataset: {} as Record<string, string | undefined> };
  // No View Transitions API: the step changes at once.
  runTransition(() => calls.push('a'), 'forward', { documentElement: el }, false);
  assert.deepEqual(calls, ['a']);
  // The API throws: the step still changes, once.
  runTransition(() => calls.push('b'), 'back', { documentElement: el, startViewTransition() { throw new Error('x'); } }, false);
  assert.deepEqual(calls, ['a', 'b']);
  assert.equal(el.dataset.dir, 'back');
  // The API works: the browser calls the update.
  const queue: (() => void)[] = [];
  const doc = { documentElement: el, startViewTransition(run: () => void) {
    queue.push(run);
    // A skipped transition rejects both promises; neither may surface as an unhandled rejection.
    return { finished: Promise.reject(new Error('skipped')), ready: Promise.reject(new Error('skipped')) };
  } };
  runTransition(() => calls.push('c'), 'forward', doc, false);
  assert.deepEqual(calls, ['a', 'b']);
  // Two taps in a row: both updates run, in order, so the last tap wins.
  runTransition(() => calls.push('d'), 'forward', doc, false);
  queue.forEach((run) => run());
  queue.forEach((run) => run()); // a browser that calls back twice must not apply an update twice
  assert.deepEqual(calls, ['a', 'b', 'c', 'd']);
  assert.equal(el.dataset.dir, 'forward');
  // Reduced motion: no transition is started.
  runTransition(() => calls.push('e'), 'forward', { documentElement: el, startViewTransition() { throw new Error('must not be called'); } }, true);
  assert.deepEqual(calls, ['a', 'b', 'c', 'd', 'e']);
}

console.log('rules checks passed');
