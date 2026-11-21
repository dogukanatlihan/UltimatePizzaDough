# Tre Passi Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the screens of makebetter.pizza as the three-step "Tre Passi" flow, with a remembered last recipe, complete English/Turkish, light/dark themes and polished motion, on the existing dough maths.

**Architecture:** `src/utils/doughCalculator.ts` and the handlers of `src/hooks/useDoughCalculator.ts` stay. New pure rules (ranges, weight formatter, saved-recipe validation) live in `src/utils/` and are covered by `npm test`. All screens in `src/design/` are replaced by step components styled with one plain-CSS file driven by custom properties. Motion uses the browser's View Transitions plus two small libraries; Emotion, styled-components and framer-motion are removed.

**Tech Stack:** React 18.2, TypeScript 5.7, Vite 6, plain CSS, `@number-flow/react`, `@formkit/auto-animate`, Cloudflare Workers static assets.

**Spec:** `docs/superpowers/specs/2026-11-22-tre-passi-redesign-design.md`. Visual reference: `design-concepts/concept-2-tre-passi.html` (port its CSS values; do not port its `calc.js`).

## Global Constraints

- Branch `redesign-tre-passi`. Nothing merges to `main` without the owner's word. Task 1's `wrangler.jsonc` change is the one exception (the owner approved preview URLs).
- `npm test`, `npm run build`, `npm run lint` pass at the end of every task (lint: 0 errors).
- No commit or PR text carries an AI attribution line.
- Every visible string goes through `t()` with `en` and `tr` values. No label truncates or overflows at 360px in either language.
- Every input has a label; touch targets 44px or more; input text 16px or more; pinch zoom allowed; visible focus; WCAG AA contrast in both themes.
- The page never scrolls sideways from 360px to 1440px.
- A recipe weight, before rounding, equals what `calculateDoughRecipe` gives today. Do not edit `src/utils/doughCalculator.ts` or the preset numbers in the hook.
- Breakpoints: one step at a time below 1040px; three columns (300px / 340px / rest) from 1040px; step tabs on their own row below 560px.
- Motion: interactions 200 ms or less, transitions 300 ms or less, ease-out for enter/leave; only `transform` and `opacity` animate (disclosure panel excepted); never `transition: all`; a slider drag never starts an animation; `prefers-reduced-motion: reduce` leaves fades of 150 ms or less only.
- Hover styles only inside `@media (hover: hover)`. Controls get `touch-action: manipulation`.
- Storage key `mbp.recipe.v1`. All `localStorage` access inside `try/catch`.
- Colours, fonts, radii: the token table in spec 5.4. Red (`--tomato`) only on the one primary action per screen and on the warning.

## Review Focus

1. **A saved record that is broken, old or edited by hand** (bad JSON, missing fields, strings for numbers, unknown style, numbers out of range, `NaN`): the app opens on the defaults at step 1 and never crashes. Test in Task 2.
2. **`localStorage` that throws** on read or write (private window, quota): the app works, without memory. Test in Task 2 (throwing storage stub) and Task 3 (contexts).
3. **A record saved in inches**: sizes are checked against the inch bounds (6–24 / 4–24), not the centimetre bounds, and restored unchanged. Test in Task 2.
4. **Weights that are negative, zero or not finite** (negative main-dough water with a large preferment): the formatter shows a number, never `NaN g` or `-0 g`. Test in Task 2.
5. **Step changes when View Transitions are missing, throw, or are triggered twice quickly**: the step still changes exactly once per tap and the final step is the last one asked for. Test in Task 7.

---

### Task 1: Preview address and branch

**Files:**
- Modify: `wrangler.jsonc`

- [ ] **Step 1:** On `main`, add `"preview_urls": true` to `wrangler.jsonc` (top level, with a comment: workers.dev preview addresses for branch builds; Cloudflare adds `X-Robots-Tag: noindex` to them).
- [ ] **Step 2:** `npm run build`; commit `chore: enable preview URLs for branch builds`; push `main`; confirm the live site still serves 200 and its CSP header.
- [ ] **Step 3:** `git switch -c redesign-tre-passi`. Commit the spec, this plan and `design-concepts/` on the branch (`docs: Tre Passi design, plan and concept mockups`).
- [ ] **Step 4:** Tell the owner the one dashboard step that may need them: Workers & Pages → `makebetter-pizza` → Settings → Build → turn on preview builds for non-production branches (preview command `npx wrangler preview`). Do not block later tasks on it.

### Task 2: Pure rules — ranges, formatter, saved recipe

**Files:**
- Create: `src/utils/ranges.ts`, `src/utils/format.ts`, `src/utils/savedRecipe.ts`, `src/utils/rules.check.ts`, `src/utils/all.check.ts`
- Modify: `package.json` (`test` script bundles `src/utils/all.check.ts`, which imports `./doughCalculator.check` and `./rules.check`)

**Interfaces — Produces:**
```ts
// ranges.ts
export type Range = readonly [min: number, max: number, step: number];
export const RANGES: Record<'numberOfPizzas'|'thicknessFactor'|'hydration'|'salt'|'yeast'|'yeastFresh'|'oil'|'sugar'|'diastaticMalt'|'doughEnhancer'|'prefermentPercentage'|'prefermentHydration', Range>;
//  [1,20,1] [0.03,0.15,0.01] [50,85,1] [1,4,0.1] [0,2,0.01] [0,6,0.01] [0,10,0.5] [0,5,0.5] [0,2,0.1] [0,2,0.1] [10,100,5] [50,125,5]
export const sizeBounds: (useInches: boolean) => { diameter: readonly [number, number]; pan: readonly [number, number] };
//  cm: diameter [15,60], pan [10,60] · inches: diameter [6,24], pan [4,24]
export const usualBatch: (styleId: string) => number;        // 1 when PIZZA_STYLES entry has isRectangular true or 'both', else 4
export const clamp: (value: number, min: number, max: number) => number;

// format.ts
export const gramsNumber: (g: number, opts?: { yeast?: boolean; locale?: string }) => string; // digits only
export const formatGrams: (g: number, opts?: { yeast?: boolean; locale?: string }) => string; // gramsNumber + ' g'
export const formatOunces: (g: number, locale?: string) => string;                              // '16.1 oz'

// savedRecipe.ts
export const STORAGE_KEY = 'mbp.recipe.v1';
export const parseSavedInputs: (raw: string | null) => DoughCalculatorInputs | null;
export const loadSavedInputs: (storage?: Pick<Storage, 'getItem'>) => DoughCalculatorInputs | null;
export const saveInputs: (inputs: DoughCalculatorInputs, storage?: Pick<Storage, 'setItem'>) => void;
export const clearSavedInputs: (storage?: Pick<Storage, 'removeItem'>) => void;
```

- [ ] **Step 1: Write the failing checks** in `src/utils/rules.check.ts` (same style as `doughCalculator.check.ts`: `node:assert/strict`, top-level blocks, a final `console.log`):

```ts
// formatter: reads like a kitchen scale
assert.equal(formatGrams(457.3), '457 g');
assert.equal(formatGrams(9.74), '9.7 g');
assert.equal(formatGrams(0.234), '0.23 g');
assert.equal(formatGrams(5.2, { yeast: true }), '5.2 g');
assert.equal(formatGrams(12.345, { yeast: true }), '12.35 g');
assert.equal(formatGrams(-113.5), '-114 g');
assert.equal(formatGrams(-0.001), '0 g');            // never "-0"
assert.equal(formatGrams(NaN), '0 g');
assert.equal(formatGrams(Infinity), '0 g');
assert.equal(formatGrams(0.234, { locale: 'tr' }), '0,23 g');
assert.equal(formatOunces(457.3), '16.1 oz');
assert.equal(formatOunces(13), '0.46 oz');

// batch and bounds
assert.equal(usualBatch('neapolitan'), 4); assert.equal(usualBatch('detroit'), 1); assert.equal(usualBatch('focaccia'), 1);
assert.deepEqual(sizeBounds(true).diameter, [6, 24]); assert.deepEqual(sizeBounds(false).pan, [10, 60]);

// saved recipe: `good` is a full valid DoughCalculatorInputs for New York, 6 pizzas, cm
assert.deepEqual(parseSavedInputs(JSON.stringify(good)), good);
for (const bad of [null, '', '{', '[]', '"x"', JSON.stringify({ ...good, pizzaStyle: 'calzone' }), JSON.stringify({ ...good, hydration: 'wet' }),
  JSON.stringify({ ...good, yeastType: 'wild' }), JSON.stringify({ ...good, preferment: { type: 'levain', percentage: 30, hydration: 100 } }),
  JSON.stringify({ ...good, salt: null }), JSON.stringify({ hydration: 60 })]) assert.equal(parseSavedInputs(bad), null);
assert.equal(parseSavedInputs(JSON.stringify({ ...good, hydration: 400 }))!.hydration, 85);       // clamped, not discarded
assert.equal(parseSavedInputs(JSON.stringify({ ...good, numberOfPizzas: 0 }))!.numberOfPizzas, 1);
const inches = { ...good, useInches: true, pizzaDiameter: 17.7 };
assert.equal(parseSavedInputs(JSON.stringify(inches))!.pizzaDiameter, 17.7);                       // inch bounds
assert.equal(parseSavedInputs(JSON.stringify({ ...inches, pizzaDiameter: 45 }))!.pizzaDiameter, 24);
assert.equal(parseSavedInputs(JSON.stringify({ ...good, yeastType: 'fresh', yeast: 4 }))!.yeast, 4); // fresh range goes to 6

// storage that throws
const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); }, removeItem() { throw new Error('denied'); } };
assert.equal(loadSavedInputs(broken), null); assert.doesNotThrow(() => saveInputs(good, broken)); assert.doesNotThrow(() => clearSavedInputs(broken));
```
- [ ] **Step 2:** Run `npm test`. Expected: FAIL (modules not found).
- [ ] **Step 3:** Implement the three modules to the signatures above. `gramsNumber`: not finite → `'0'`; `Intl.NumberFormat(locale ?? 'en', { maximumFractionDigits })` with 2 when `yeast` or `|g| < 1`, 1 when `|g| < 10`, else 0; turn `-0` into `0`; `useGrouping: false`. `parseSavedInputs` returns a fresh object with exactly the `DoughCalculatorInputs` fields (unknown fields dropped); `isRectangular` must be boolean; storage functions default to `window.localStorage` and swallow every error.
- [ ] **Step 4:** Run `npm test`. Expected: `doughCalculator checks passed` and `rules checks passed`.
- [ ] **Step 5:** Commit `feat: range, weight-format and saved-recipe rules`.

### Task 3: Hook — remember, start over, batch rule; guarded contexts

**Files:**
- Modify: `src/hooks/useDoughCalculator.ts`, `src/context/ThemeContext.tsx`, `src/context/TranslationContext.tsx`, `src/utils/analytics.ts`

**Interfaces — Consumes:** Task 2. **Produces** (added to the hook's return value; existing fields unchanged):
```ts
restored: boolean;                                  // a saved recipe was loaded at start-up
startOver: () => DoughCalculatorInputs;             // clears storage, resets to defaults, returns the inputs it replaced
restore: (inputs: DoughCalculatorInputs) => void;   // puts a recipe back (Undo) and saves it
// analytics.ts
export const trackCopy: () => void; export const trackPrint: () => void; export const trackStartOver: () => void; // 'copy_recipe' | 'print_recipe' | 'start_over'
```

- [ ] **Step 1:** Initial state `useState(() => loadSavedInputs() ?? DEFAULT_INPUTS)`; `restored` from the same read. `DEFAULT_INPUTS.numberOfPizzas` becomes 4 (nothing else in it changes).
- [ ] **Step 2:** Save: in the existing `useEffect([inputs])`, skip the first run after mount, then `saveInputs(inputs)`. (Every later change comes from a handler, so "after the first user action" holds.)
- [ ] **Step 3:** `handlePizzaStyleChange(styleId)`: when `styleId === inputs.pizzaStyle`, return without changing anything. Otherwise as today, plus `numberOfPizzas: usualBatch(styleId)` unless the user has changed the count (a `countTouched` ref set by `handleInputChange('numberOfPizzas', …)`, and `true` from the start when `restored`).
- [ ] **Step 4:** `startOver` and `restore` as in Interfaces; `startOver` resets `countTouched`; `resetToDefaults` stays for compatibility and calls `startOver`.
- [ ] **Step 5:** Wrap the `localStorage` reads and writes in `ThemeContext.tsx` (lines 19, 33) and `TranslationContext.tsx` (language read and write) in `try/catch`, falling back to the system theme and `'en'`.
- [ ] **Step 6:** Add the three analytics functions. Run `npm test && npm run build && npm run lint`. Expected: pass, 0 lint errors.
- [ ] **Step 7:** Commit `feat: remember the last recipe; start over; usual batch per style`.

### Task 4: Assets, tokens, fonts, dependencies

**Files:**
- Create: `src/assets/style-{neapolitan,newyork,sicilian,detroit,pan,focaccia}.webp`
- Delete: the six `src/assets/style-*.png`
- Modify: `src/design/styleMeta.ts`, `src/index.css` (rewrite), `index.html`, `public/manifest.json`, `package.json`

**Interfaces — Produces:**
```ts
// styleMeta.ts
export const STYLE_IMAGES: Record<string, string>;                       // webp imports
export const STYLE_TINT: Record<string, string>;                         // dominant colour per photo, for the fade-in ground
export const BAKE_TEMP: Record<string, string>;                          // unchanged
export const BAKE_TIME: Record<string, { from: number; to: number; unit: 'min' | 'sec' }>;
```
CSS custom properties on `:root`, dark values under `[data-theme="dark"]`: `--ground --card --ink --ink-2 --line --basil --basil-deep --basil-tint --header --tomato --on-basil --on-tomato --r-card(20px) --r-ctl(14px) --font-display --font-body --ease-out --spring`.

- [ ] **Step 1:** `cwebp -q 78 -resize 800 0 src/assets/style-X.png -o src/assets/style-X.webp` for the six; lower `-q` until each is 160 KB or less; record width and height for the `<img>` attributes; delete the PNGs.
- [ ] **Step 2:** Update `styleMeta.ts` to the interface above (`STYLE_HINTS` removed; `BAKE_TIME` values from today's strings; `STYLE_TINT` sampled from each photo).
- [ ] **Step 3:** Rewrite `src/index.css`: reset, the tokens (spec 5.4 values; `--spring` is a `linear()` curve declared after an `ease-out` fallback), base type (`text-wrap: balance` on headings, `tabular-nums` on numbers; a local fallback `@font-face` with `size-adjust` for each web font so text does not jump when the font arrives), one focus-ring rule, `-webkit-tap-highlight-color: transparent`, normal document scrolling (remove `html{overflow:hidden}` and `body{position:fixed}`), the reduced-motion block. Remove the Google-Translate and legacy rules.
- [ ] **Step 4:** `index.html`: one Google Fonts link for Bricolage Grotesque (500, 700, 800) and Figtree (400, 500, 600, 700) with `display=swap`; remove the other font families; `theme-color` `#1C5A3A`. `manifest.json`: `theme_color` `#1C5A3A`, `background_color` `#F1F5EE`.
- [ ] **Step 5:** `npm install @number-flow/react @formkit/auto-animate`. (The five old libraries are removed in Task 6, once nothing imports them.)
- [ ] **Step 6:** `npm run build`: expected pass; `ls -la src/assets/*.webp`: each 160 KB or less. Commit `feat: design tokens, fonts and light photos`.

### Task 5: Strings

**Files:**
- Modify: `src/context/TranslationContext.tsx`

**Interfaces — Produces:** `t(key, vars?)` gains an optional second argument that replaces `{name}` placeholders: `t: (key: string, vars?: Record<string, string | number>) => string`. New keys, English and Turkish:

`step.style` `step.size` `step.recipe` `step.of` ("Step {n} of 3") · `s1.title` · `style.<id>.short` ×6 (about 40 characters; English from the mockup's blurbs) · `s2.title` `chip.change` `size.pizzas` `size.diameter` `size.panWidth` `size.panLength` `size.shape` `size.rectPan` `size.measureIn` `crust.label` `crust.thin` `crust.medium` `crust.thick` `crust.extraThick` `crust.ball` ("Each dough ball: {g}") `a11y.less` `a11y.more` · `s3.title` `recipe.totalDough` `stage.dayBefore` ("Day before · {name}") `stage.bakingDay` `water.label` `water.firmer` `water.wetter` `water.feel.firm` `water.feel.classic` `water.feel.soft` `water.feel.wet` `tune.title` `tune.sub` `form.doughEnhancer` `form.sponge` `form.sourdough` `pref.title` `pref.sub.none` `pref.sub.on` ("{name}, {pct}% of the flour") `pref.type` `pref.share` `pref.water` `pref.hint` `method.one` `method.two` `bake.title` `bake.oven` `bake.time` `bake.flour` `unit.min` `unit.sec` `action.copy` `action.copied` `action.print` · `bar.next` `bar.see` `bar.back` `bar.dough` ("{g} dough") `bar.flour` ("Flour {g}") `bar.water` ("Water {g}") · `footer.startOver` `toast.startedOver` `toast.undo` `a2hs.button` `a2hs.ios` `theme.toLight` `theme.toDark` `lang.toTurkish` `lang.toEnglish`.

- [ ] **Step 1:** Add the `vars` argument and the keys. Existing keys used by the new screens stay as they are (`form.*`, `ingredient.*`, `dough.step*`, `mainDough.step*`, `preferment.step*`, `baking.step*`, `flour.<id>`, `preferment.waterWarning`, `recipe.copied`, `recipe.copyFailed`, `units.*`, `app.footer`).
- [ ] **Step 2:** Add a check to `src/utils/rules.check.ts`: every key in the table has non-empty `en` and `tr`, and each pair uses the same set of `{placeholders}` (export the table for the check). Run `npm test`: expected pass.
- [ ] **Step 3:** Commit `feat: strings for the three-step flow, English and Turkish`.

### Task 6: Screens (no motion yet)

**Files:**
- Create: `src/design/TrePassi.tsx`, `Header.tsx`, `BottomBar.tsx`, `StepStyle.tsx`, `StepSize.tsx`, `RecipeCard.tsx`, `Tuning.tsx`, `Guide.tsx`, `recipeText.ts` (all in `src/design/`)
- Rewrite: `src/design/controls.tsx`, `src/design/design.css`
- Modify: `src/App.tsx` (renders `<TrePassi />`), `src/components/ThemeToggle.tsx`, `LanguageToggle.tsx`, `ToastProvider.tsx`, `AddToHomeButton.tsx`, `README.md`, `package.json`
- Delete: `src/design/Workshop.tsx`, `RecipePanel.tsx`, `Hero.tsx`, `StylePicker.tsx`, `Icons.tsx`, `src/components/HeaderControls.tsx`

**Interfaces — Consumes:** Tasks 2–5. **Produces:**
```tsx
// controls.tsx
Counter({ label, value, text, onLess, onMore, lessDisabled?, moreDisabled? })            // − [text] +, group labelled by `label`
RangeField({ id, label, value, range, onChange, valueText, ends?, note? })               // labelled slider; valueText like "2.8% · 13 g"
Segmented<T extends string>({ label, value, options: { value: T; label: string }[], onChange })
Disclosure({ id, title, subtitle?, defaultOpen?, children })                              // button[aria-expanded][aria-controls] + grid-rows panel
// recipeText.ts — one place that turns a recipe into words, used by Guide, RecipeCard and Copy
methodStages(recipe, inputs, t, locale): { title: string; time: string; steps: string[] }[]
bakeInfo(styleId, t): { temp: string; time: string; flour: string | null; steps: string[] }
copyText(recipe, inputs, t, locale): string
// ToastProvider
showToast(message, type, options?: { duration?: number; action?: { label: string; onAction: () => void } })
// TrePassi owns: step (1|2|3), goTo(step), and renders Header, the five blocks, BottomBar, footer
```
DOM blocks inside `<main>` in this order: `#s1` (style), `#s2` (size), `.col3` wrapping `#card` and `#guide`, with `#tune` placed by CSS: below 1040px `<main>` is a flex column, `.col3` is `display: contents`, and `order` gives card → tune → guide on step 3; from 1040px a three-column grid puts `#tune` under `#s2` and makes `.col3` sticky with its own scroll (`max-height: calc(100dvh - header)`).

- [ ] **Step 1:** `controls.tsx` and their CSS. Every control: 44px targets, 16px input text, label wiring as in the Interfaces. `RangeField` sets `--p` for the fill and calls `onChange` with the value snapped to `range[2]` and clamped.
- [ ] **Step 2:** `recipeText.ts`, using `gramsNumber`/`formatGrams`/`formatOunces` with the current locale for every weight in the existing translated step strings (the same replacements `RecipePanel.tsx` does today, moved here before that file is deleted). Add checks to `rules.check.ts`: for New York with a poolish, every step string contains no `{`; `copyText` first line is `"New York — 4 × 558 g (45 cm)"` for the defaults of that style in English; the flour weight in step text equals `gramsNumber(recipe.mainDough.flour)`.
- [ ] **Step 3:** `StepStyle` (cards: photo with `width`/`height`, `loading="lazy"` after the first two, `alt=""`, name, `style.<id>.short`, check when selected; `aria-pressed`), `StepSize` (chip below 1040px, counters with `sizeBounds`, shape for focaccia, units, crust slider with `crust.ball`), `RecipeCard` (header, rows via `formatGrams`/`formatOunces`, total, stage groups, warning), `Tuning` (water slider with `water.feel.*` thresholds under 60 / 60–68 / 69–75 / above 75; Fine-tune and Preferment disclosures; every slider's `valueText` carries its grams, the yeast slider uses `RANGES.yeastFresh` for fresh yeast), `Guide` (Method open by default, Baking, Copy, Print).
- [ ] **Step 4:** `TrePassi`, `Header` (flag strip, brand, step tabs with `aria-current="step"`, language and theme toggles), `BottomBar` (table in spec 5.1; hidden from 1040px), footer (Start over with Undo toast via `startOver`/`restore`, Add to Home, credit). Start at step 3 when `restored` and the viewport is below 1040px, else step 1. Selecting a style below 1040px goes to step 2. A step change below 1040px scrolls to top and focuses that step's heading (`tabIndex={-1}`, no focus ring on the heading).
- [ ] **Step 5:** Restyle the four widgets in plain CSS classes (no Emotion, no framer-motion): `ThemeToggle` and `LanguageToggle` as 44px header buttons with translated `aria-label`s; `ToastProvider` with the `action` option, bottom-centre above the bottom bar, `role="status"`; `AddToHomeButton` shows `a2hs.ios` through the toast instead of `alert()`.
- [ ] **Step 6:** Delete the old files; `npm uninstall @emotion/react @emotion/styled styled-components @types/styled-components framer-motion`; `grep -rn "emotion\|framer-motion\|styled-components" src` → no hits. Update `README.md` (features, stack).
- [ ] **Step 7:** `npm test && npm run build && npm run lint` pass. In a browser at 360, 390, 768, 1040, 1280, 1440px, light and dark, English and Turkish: no sideways scroll (`document.documentElement.scrollWidth <= innerWidth`), no clipped text, zero unlabeled inputs, zero targets under 44px, no console errors. Compare three recipes with the live site (Neapolitan; New York with poolish; Detroit in inches): weights equal before rounding.
- [ ] **Step 8:** Commit `feat: Tre Passi screens`.

### Task 7: Motion

**Files:**
- Create: `src/design/motion.ts`, `src/design/Num.tsx`
- Modify: `src/design/TrePassi.tsx`, `StepStyle.tsx`, `StepSize.tsx`, `RecipeCard.tsx`, `Tuning.tsx`, `controls.tsx`, `design.css`, `src/components/ToastProvider.tsx`, `src/utils/rules.check.ts`

**Interfaces — Produces:**
```ts
// motion.ts
export type Direction = 'forward' | 'back';
export function runTransition(update: () => void, direction: Direction, doc?: Pick<Document, 'documentElement'> & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }, reduced?: boolean): void;
// Num.tsx — rolling number; plain text while a slider is being dragged
export function Num(props: { value: number; yeast?: boolean; suffix?: string }): JSX.Element;
export const DragContext: React.Context<boolean>;   // true between pointerdown and pointerup/cancel on any RangeField
```

- [ ] **Step 1: Write the failing checks** for `runTransition` in `rules.check.ts`:

```ts
const calls: string[] = []; const el = { dataset: {} as Record<string, string> };
runTransition(() => calls.push('a'), 'forward', { documentElement: el } as never);                 // no API: runs at once
assert.deepEqual(calls, ['a']);
runTransition(() => calls.push('b'), 'back', { documentElement: el, startViewTransition() { throw new Error('x'); } } as never);
assert.deepEqual(calls, ['a', 'b']);                                                                 // API throws: still runs, once
let cb: () => void = () => {};
const doc = { documentElement: el, startViewTransition(f: () => void) { cb = f; return { finished: Promise.resolve() }; } };
runTransition(() => calls.push('c'), 'forward', doc as never); cb();
assert.deepEqual(calls, ['a', 'b', 'c']); assert.equal(el.dataset.dir, 'forward');
runTransition(() => calls.push('d'), 'forward', doc as never, true);                                 // reduced motion: no transition
assert.deepEqual(calls, ['a', 'b', 'c', 'd']);
```
- [ ] **Step 2:** `npm test` → FAIL. Implement `runTransition` (sets `documentElement.dataset.dir`; calls `update` exactly once on every path; in the app, `update` wraps the state change in `flushSync`). `npm test` → pass.
- [ ] **Step 3:** Step change and photo morph: `goTo` uses `runTransition`. CSS: `::view-transition-old/new(root)` slide 250 ms `var(--ease-out)` by `[data-dir]`; `view-transition-name: style-photo` on exactly one element at a time (the tapped card's photo on step 1, the chip photo on step 2, the recipe header photo on step 3; inline style set from state). From 1040px no step transition runs; the header photo crossfades.
- [ ] **Step 4:** `Num` with `@number-flow/react`, formatted to match `gramsNumber` (same fraction-digit rule, current locale); `animated={!dragging}`. Use it for recipe weights, the ball weight, counters and the bottom bar. `RangeField` sets `DragContext` on pointer down/up/cancel and on keyboard use leaves it false.
- [ ] **Step 5:** `useAutoAnimate` on the ingredient list containers in `RecipeCard`. Segmented pill: one absolutely positioned element moved with `transform`, 250 ms `var(--spring)`. Press: `:active { transform: scale(.97) }` 120 ms on buttons and cards; selected check scales from 0.9 with a fade. Copy: label swaps to `action.copied` with an SVG check drawn by `stroke-dashoffset`. Toast: `@starting-style` enter 200 ms, `element.animate` exit 150 ms then removal. Photos: fade in on `load` over `STYLE_TINT`. Disclosure: `grid-template-rows` 0fr → 1fr, 250 ms.
- [ ] **Step 6:** Reduced motion: `runTransition` skips the API; one CSS block removes transforms and row/pill/number motion and leaves fades of 150 ms or less.
- [ ] **Step 7:** Browser check: dragging any slider changes numbers with no roll and starts no transition; double-tapping a step tab lands on the tapped step; every moving control responds mid-animation; with reduced motion emulated nothing slides. `npm test && npm run build && npm run lint` pass. Built script is no larger than 109 kB gzip (`gzip -c dist/assets/index-*.js | wc -c`).
- [ ] **Step 8:** Commit `feat: motion — step transitions, rolling numbers, moving rows`.

### Task 8: Verify, preview, hand over

- [ ] **Step 1:** Full matrix from spec section 8 on the built site (`npm run build && npx vite preview`): six widths × two themes × two languages; keyboard-only pass; layout shift under 0.1 on first load (Performance trace); first-load transfer below today's.
- [ ] **Step 2:** Saved recipe by hand: change a value, reload → step 3 with the value; put `{` in `mbp.recipe.v1`, reload → defaults at step 1; Start over → defaults, Undo restores.
- [ ] **Step 3:** Push the branch. If the Cloudflare preview build exists, open the preview address and check: 200, CSP header present, no CSP violation in the console (NumberFlow, AutoAnimate), `X-Robots-Tag: noindex`.
- [ ] **Step 4:** Independent review of the whole branch against the spec (fresh reviewer). Fix what it confirms.
- [ ] **Step 5:** Report to the owner: preview address, what was verified and how, what was not (real iPhone and Android: theirs to try), the Turkish strings to review. Wait for the owner's word before any merge to `main`.
