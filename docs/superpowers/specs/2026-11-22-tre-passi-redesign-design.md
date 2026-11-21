# Make Better Pizza — "Tre Passi" redesign

Status: for owner approval · 2026-11-22 · reviewed once by an independent builder agent
Visual reference (working mockup): `design-concepts/concept-2-tre-passi.html` (open it with `design-concepts/calc.js` and `design-concepts/img/` beside it).
Published comparison of all five concepts: https://claude.ai/artifact/PZdjfZDXEdki94RcDXq4AQ

## 1. Intent

The owner's words about today's site: it "doesn't feel polished and intuitive, and looks outdated". The new
design must feel "modern and traditional both", be "completely responsive and mobile compatible", and
"most of all, easy to use and intuitive". After choosing the concept the owner added: "include proper high
quality polished animations".

The owner chose concept 2, **Tre Passi**: a three-step flow (style, size, recipe). This document turns that
mockup into the real app.

Who it is for: a first-time home baker on a phone gets a good recipe in about two taps. An enthusiast's
percentages are one tap away and never in the way. A regular who comes back lands on their last recipe.

## 2. Goals, non-goals, anti-goals

**Goals**
- The three-step flow of the mockup, on phones and desktops.
- On a phone, the key result stays on screen while any control changes.
- A returning visitor lands on step 3 with their last recipe (owner decision).
- Polished motion (section 7) that never slows a task.
- English and Turkish complete: no hardcoded visible string.
- Light and dark themes.
- Faster first load than today (six style photos are about 1 MB each).

**Non-goals** (do not build)
- Saved or named recipes, accounts, sharing links.
- New pizza styles, new ingredients, any change to the dough maths or presets.
- A new social thumbnail, logo or app icons.
- A service worker / offline mode.

**Anti-goals** (it has failed if any of these is true, even when everything works)
- A user must scroll to see the effect of the control they are moving.
- Advanced percentages are visible before the user asks for them.
- An animation delays input, replays on every slider tick, or plays for users who asked for reduced motion.
- The page scrolls sideways at any width from 360px to 1440px.
- A recipe weight differs, before rounding, from what the current live site gives for the same inputs.
  (How weights are rounded for display changes on purpose; see 5.1.)

## 3. Constraints

- Stack stays React + TypeScript + Vite, static build, Cloudflare Workers assets. A push to `main` deploys to
  https://makebetter.pizza. Work on a branch; nothing merges to `main` without the owner's word.
- The CSP in `public/_headers` allows scripts from self and inline (plus Google Analytics and the
  Cloudflare beacon), styles from self, inline and Google Fonts, fonts from `fonts.gstatic.com`, images
  from self and `data:`.
  New assets must fit it, or the header changes in the same commit.
- `npm test`, `npm run build` and `npm run lint` pass. CI runs all three.
- Accessibility floor: every input has a label; touch targets are 44px or more; inputs use 16px text or
  larger; pinch zoom stays allowed; visible keyboard focus; WCAG AA contrast in both themes.
- The repo owner's rule: no AI attribution lines in commits or pull requests.

## 4. Approaches considered

1. **New screens on the existing calculator code — chosen.** `src/utils/doughCalculator.ts` and
   `src/hooks/useDoughCalculator.ts` stay; they were corrected and verified on the live site on 2026-11-22
   and are covered by `src/utils/doughCalculator.check.ts`. Only the screens are rebuilt. Styling moves to
   one system (plain CSS with custom properties).
2. New screens, old widgets and their libraries kept as they are. Less work, but two styling systems
   (Emotion and plain CSS) and unused libraries stay in the bundle.
3. Replace the calculator code with the mockup's `calc.js`. Closest to the mockup, but it discards code
   that was just fixed and verified, for no user-visible gain.

The owner left the "how" to the builder. Choice 1 is the builder's call, not an owner decision.

## 5. What gets built

### 5.1 Structure

Three steps. Below 1040px one step shows at a time; from 1040px all three show as columns (about
300px / 340px / rest) and the step navigation becomes plain headings. From 1040px the water slider and
the Fine-tune and Preferment disclosures sit in the middle column under the size controls, and the
recipe card in the third column is sticky, so the recipe stays beside whatever is being changed. (The
mockup has them under the recipe at every width; this is the builder's change for desktop.)

**Header (all widths)**: brand "Make Better Pizza"; step tabs "1 Style · 2 Size · 3 Recipe" (below 1040px
they are buttons that jump to a step, with `aria-current="step"`; below 560px they sit on their own row);
language toggle (EN/TR); theme toggle. A thin green-white-red strip sits above the header.

**Step 1 — Style.** Heading "Which pizza are you making?". Six photo cards (two columns on a phone, a
compact one-column list on desktop): photo, name, one short line. The existing `style.<id>.desc`
strings are 64–94 characters, too long for a two-column card at 360px, so add short ones
(`style.<id>.short`, about 40 characters, English and Turkish; the mockup's lines are the English start). The selected card shows a check. Tapping a card that is **not** selected selects it, loads that style's presets
(`handlePizzaStyleChange`) and, below 1040px, moves to step 2. Tapping the card that **is already
selected** changes nothing in the recipe and only moves to step 2, so going back through "Change" never
wipes a user's adjustments.

**Step 2 — Size.** Heading "How many, and how big?". Below 1040px a small chip above the heading shows the
chosen style (photo, name) with "Change", which goes back to step 1 (see 7.2).
- Pizzas: counter, 1–20. Until the user changes the count themselves, choosing a style sets it to that
  style's usual batch: 4 for round styles, 1 for pan styles (Sicilian, Detroit, focaccia). After the
  user has changed it, a style change keeps their number.
- Size: diameter counter for round shapes; pan width and pan length counters for rectangular ones. One
  press changes the value by 1 in the unit shown. Bounds: diameter 15–60 cm / 6–24 in; pan sides
  10–60 cm / 4–24 in (the bounds the live app already uses).
- Shape (focaccia only): rectangular pan / round (`handleShapeToggle`).
- Measure in: centimetres / inches (`handleUseInchesChange`).
- Crust: slider thin ↔ thick (`thicknessFactor` 0.03–0.15, step 0.01) with the text "Each dough ball:
  N g".

**Step 3 — Recipe.**
- Recipe card: style photo, name, "N × ball g · size"; one row per ingredient (name, grams, ounces as
  secondary, baker's %); total dough. Weights are shown the way a kitchen scale reads: whole grams from
  10 g up, one decimal below 10 g, two decimals below 1 g and for yeast. **One formatter** produces the
  weights in the card, in the method text and in the copied text, so the three always agree (today the
  card and the method round separately). With a preferment: a "day before" group and a "baking day" group
  (`recipe.preferment`, `recipe.mainDough`), and the existing warning when main-dough water is negative.
- Water slider (hydration 50–85%) with a plain-language line that changes with the value
  (under 60 firm; 60–68 classic; 69–75 soft and airy; above 75 very wet, for pans).
- Every percentage slider on this step shows the weight it produces beside the percent (for example
  "2.8% · 13 g"; the preferment sliders show the preferment's flour and water). That is what keeps the
  effect of a control on screen while it moves, on every layout.
- "Fine-tune" disclosure, closed by default: salt, yeast %, yeast type (instant / active dry / fresh;
  the yeast slider goes to 6% for fresh, 2% otherwise), oil, sugar, diastatic malt, dough enhancer.
- "Preferment" disclosure, closed by default: none / poolish / biga / sponge / sourdough, then share of
  flour (10–100%) and preferment hydration (50–125%) when one is chosen.
- "Method" disclosure (open by default) and "Baking" disclosure (all four disclosures are built as in 7.1): the existing translated step texts
  (`dough.step*`, `mainDough.step*`, `preferment.step*`, `baking.step*`, `flour.<id>`) and
  `BAKE_TEMP` / `BAKE_TIME` from `src/design/styleMeta.ts`. Do not use the mockup's rewritten English
  method text; the app's existing strings are already translated.
- Actions: **Copy recipe** (toast on success and on failure, as today) and **Print**. No "Save" button.

**Bottom bar (below 1040px only)**, fixed to the bottom, above the safe area: Back (hidden on step 1);
a two-line summary; one primary button.
| Step | Summary line 1 | Summary line 2 | Primary button |
|---|---|---|---|
| 1 | Style · N × ball g | total g dough · size | Next: size |
| 2 | Style · N × ball g | total g dough · size | See recipe |
| 3 | Flour g | Water g · N × ball g | Copy recipe |

**Footer**: "Start over" (see 5.2), the Add-to-Home button (only when the browser offers install or on
iOS outside standalone mode, as today), and the existing credit line. On iOS the Add-to-Home help
currently uses `alert()`; replace it with an in-page message.

### 5.2 Remembering the last recipe (new behaviour)

- Storage: `localStorage`, one key, `mbp.recipe.v1`, holding the calculator inputs
  (`DoughCalculatorInputs`). The existing `theme` and `language` keys are unchanged.
- Write: on every input change **after the first user action**. A visitor who only looks does not get a
  saved recipe.
- Read, once, at start-up. If a valid record exists: restore it and open step 3 (below 1040px). Otherwise
  use the defaults and open step 1.
- Validation is a pure function (testable): the style id must exist; every number must be finite and is
  clamped to its control's range; yeast type and preferment type must be known values; anything else
  discards the record. All storage access is wrapped in `try/catch` (private windows throw).
- "Start over" deletes the record, restores the defaults, and opens step 1. It asks for no confirmation
  and shows an "Undo" toast for a few seconds that puts the previous recipe back.
- Privacy: the record never leaves the browser. Do not send its contents to analytics beyond the
  events that already exist.

### 5.3 Language and theme

- Every visible string goes through `t()` in `src/context/TranslationContext.tsx`, with English and
  Turkish values. This includes strings that are hardcoded today (for example "Sponge", "Sourdough",
  "Dough enhancer", "Pizzas", "Diameter", "Copy recipe", "Print", unit names).
- Turkish text is longer in places. No label may truncate or overflow at 360px in either language.
- Theme follows the existing `ThemeContext` (`data-theme` on the root, saved choice, system default).

### 5.4 Visual system

Tokens are CSS custom properties on `:root`, redefined under `[data-theme="dark"]`.

| Token | Light | Dark (builder's proposal; adjust to pass AA) |
|---|---|---|
| ground | `#F1F5EE` | `#0F1712` |
| card | `#FFFFFF` | `#18221B` |
| ink | `#13241A` | `#E9F0E8` |
| ink-2 | `#55675B` | `#9DAD9F` |
| line | `#D5E0D3` | `#2A382D` |
| basil (selected, sliders, header) | `#1C5A3A` | header `#0C2A1B`, accents `#5FB583` |
| basil-deep / basil-tint | `#113D27` / `#E3EEE4` | `#0C2A1B` / `#1E3327` |
| tomato (primary action only) | `#D43D2B` | `#E5553F` |

- Type: "Bricolage Grotesque" (headings, numbers) and "Figtree" (text), from Google Fonts, with system
  fallbacks. Numbers use `tabular-nums`. Remove the fonts the new design does not use from `index.html`.
- Radius 20px on cards and blocks, 13–16px on controls. Spacing on a 4px scale.
- Red is used for the one primary action per screen and for the warning. Nothing else.
- `theme-color` in `index.html` and the colours in `public/manifest.json` change to the new palette.

### 5.5 Photos

The six style photos (`src/assets/style-*.png`, 0.9–1.1 MB each) are re-encoded: about 800px wide, WebP,
160 KB or less each (re-encode from the original PNGs; the mockup's 720px JPEGs are up to 206 KB and
do not meet this), with
`width`/`height` attributes, `loading="lazy"` below the first row, and empty `alt` (the name is in text).

## 6. Code shape

Kept as is: `src/utils/doughCalculator.ts`, `src/types/index.ts`, `src/utils/analytics.ts`
(events stay; add `copy_recipe`, `print_recipe`, `start_over`; report step views with the existing
`trackTabChange`).

Changed:
- `src/hooks/useDoughCalculator.ts` gains start-up from storage, saving, "start over" and the batch
  rule in 5.1. The hook has no tests today (`doughCalculator.check.ts` covers the pure maths only), so
  the new logic goes into pure functions (saved-record validation, usual batch for a style, the weight
  formatter) that `npm test` checks. The starting inputs are derived from the Neapolitan preset, so the
  first screen and "choose Neapolitan" can never drift apart again (they did until 2026-11-22).
- `src/context/ThemeContext.tsx` and `TranslationContext.tsx` read and write `localStorage` unguarded;
  a browser that throws there stops the app at start-up. Wrap those calls in `try/catch`.
- `src/design/styleMeta.ts` stays (bake temperatures, bake times, photo map). Its `STYLE_HINTS` are
  unused in the new design and go. The unit words in `BAKE_TIME` ("min", "s") go through `t()`.

Replaced: the screens in `src/design/` (`Workshop`, `RecipePanel`, `Hero`, `StylePicker`, `controls`,
`design.css`). `src/components/` widgets (`ThemeToggle`, `LanguageToggle`, `ToastProvider`,
`AddToHomeButton`, `HeaderControls`) are restyled in the same plain CSS.

Removed from `package.json` once nothing imports them: `@emotion/react`, `@emotion/styled`,
`styled-components`, `@types/styled-components`, `framer-motion`. Added: `@number-flow/react`,
`@formkit/auto-animate` (section 7).

`src/index.css` today pins `html` to `overflow: hidden` and `body` to `position: fixed` and scrolls an
inner element. The new layout uses normal document scrolling with a sticky header and a fixed bottom
bar, with `env(safe-area-inset-*)` padding; check it in iOS standalone (home-screen) mode.

Left to the builder: component and file names, CSS organisation, how step state is held, exact Turkish
wording (the owner is a native speaker and will review it).

## 7. Motion

The owner asked for "proper high quality polished animations" and suggested Remotion or Framer Motion
"or a better new one". Research on 2026-11-22 (library docs, npm, MDN browser-compat data, locally
measured bundle sizes; nothing was run on a real phone) gave these facts:

- **Remotion** renders video files from React code. It does not animate a live interface. Not used.
- **Motion** (the new name of Framer Motion, v14) is capable but heavy for this app: about 35 kB gzip
  for enter/exit animations and about 52 kB once shared-element layout animation is needed. Its animated
  number component is paid. The app ships framer-motion 10 today (about 34 kB gzip) for one toggle knob
  and the toast.
- **The browser now does most of this itself.** Same-document View Transitions work in current Chrome,
  Safari (iOS 18+) and Firefox (144+). They give the shared-element morph for free.

### 7.1 Decision (builder's call, from that research)

| Interaction | Technique | Cost (gzip) | Where the browser lacks it |
|---|---|---|---|
| Step change; photo morph | View Transitions: `document.startViewTransition` wrapping the React update in `flushSync`. Slide direction from a class on `<html>` | 0 | Feature check; the step changes at once |
| Numbers changing | NumberFlow (`@number-flow/react`, MIT) | about 6 kB | Plain numbers |
| Ingredient rows appearing, leaving, reflowing | AutoAnimate (`@formkit/auto-animate`, MIT) | about 4 kB | Rows change at once |
| Disclosures opening and closing | A button plus a panel that animates `grid-template-rows: 0fr → 1fr` | 0 | Works in all current browsers |
| Press feedback, sliding selection pill, toast, bottom-bar text | CSS transitions, `@starting-style`, Web Animations for the toast exit | 0 | Plain state change |

`framer-motion` is removed. Net effect: the script gets about 20 kB gzip smaller while gaining motion.
React stays at 18.2: React 19.3's built-in `<ViewTransition>` would add about 23 kB for no gain here.

Disclosures do **not** use `<details>` with `interpolate-size`: Safari does not support it, so iPhones
would get no height animation. The button-and-panel form needs `aria-expanded` and `aria-controls`.

### 7.2 The moments

1. **The photo carries through.** Tap a style card: its photo travels and resizes into a small "selected
   style" chip at the top of step 2 (photo, name, "Change"), then into the recipe header on step 3. One
   element owns the transition name at a time. On desktop, where all steps are visible, the chip is not
   shown and the recipe header photo crossfades. (The chip is new compared with the mockup; it also
   reminds the user what they chose.)
2. **Steps slide.** Forward: the new step enters from the right; back: from the left. 250 ms, ease-out.
3. **Numbers roll** when a value changes by a discrete action: counter press, style, shape, units, yeast
   type, preferment. **While a slider is being dragged, numbers update at once with no roll**
   (`animated={false}` during the drag), then settle.
4. **Rows move.** Adding olive oil slides its row in and the rows below make room; removing it reverses.
5. **Selection pills slide** between options (units, shape, yeast type, preferment) on a spring curve
   (`linear()` easing with an `ease-out` fallback declared first).
6. **Press feedback.** Buttons and cards scale to 0.97 while pressed, 120 ms. The selected check on a
   card scales in from 0.9 with a fade.
7. **Copy succeeds.** The button label swaps to "Copied" with a drawn check, then returns; the toast
   enters from below in 200 ms and leaves in 150 ms.
8. **Photos fade in** over a flat tint of their dominant colour once decoded, so nothing pops.

Deliberately not animated: the slider fill and thumb position (they follow the finger), keyboard-driven
changes, and the light/dark switch (colours change at once; animating every surface looks slow).
No page-load entrance choreography.

### 7.3 Rules

- Interactions 200 ms or less; transitions 300 ms or less. Entering and leaving use ease-out.
- Animate `transform` and `opacity` only (the disclosure panel is the one exception). Never
  `transition: all`.
- Everything is interruptible. A View Transition blocks taps on the moving elements while it plays and
  only one runs at a time, so: 300 ms at most, and never started from a slider.
- `prefers-reduced-motion: reduce`: no slides, no morph, no rolling, no row movement; a fade of 150 ms
  or less may remain. NumberFlow and AutoAnimate respect the setting themselves; View Transitions and
  the CSS need an explicit rule.
- Hover styles only inside `@media (hover: hover)`. Controls get `touch-action: manipulation`.

### 7.4 Polish that is not motion

- No layout shift: photos carry `width`/`height`; fonts load with `display=swap` and a metric-matched
  fallback so text does not jump.
- `text-wrap: balance` on headings; tabular numbers; one focus-ring style everywhere.
- The system tap highlight is replaced by the press feedback above.

### 7.5 Not yet verified (the builder must check, on real devices)

- `flushSync` inside `startViewTransition` with this app's React 18.2 state updates.
- The photo morph on a mid-range Android phone and an iPhone (smoothness, no flash).
- NumberFlow and AutoAnimate under this site's CSP: no violations in the console.
- If the morph is not smooth on real phones, drop it and keep the slide. The flow must never wait for it.

## 8. Verification

- `npm test` (existing dough checks, plus the saved-recipe validation function), `npm run build`,
  `npm run lint`: all pass.
- For the same inputs, every recipe number equals the live site's (compare three styles, with and
  without a preferment, in cm and inches).
- Browser check at 360, 390, 768, 1040, 1280 and 1440px wide; light and dark; English and Turkish: no
  sideways scroll, no clipped label, bottom bar clear of the safe area.
- Keyboard only: every control reachable in order, visible focus, step change moves focus to the new
  step's heading.
- Reduced motion on: no movement beyond short fades.
- Motion: no dropped frames visible on the step change; dragging a slider never starts an animation;
  every animated control still responds mid-animation.
- Layout shift (CLS) under 0.1 on first load.
- First load transfers less than today's (about 6 MB of images plus 334 kB of script), and the script
  alone is no larger than today's 109 kB gzip.
- A real iPhone and a real Android phone before it goes live (the mockups were checked in desktop
  Chrome's phone emulation only). This needs an HTTPS address that serves the real headers: a local
  preview does not apply `public/_headers`, and clipboard and install do not work on a plain LAN
  address. See section 10.

## 9. Decisions the owner made

| Question | Decision |
|---|---|
| Which concept | 2, Tre Passi |
| Returning visitors | Land on their last recipe (5.2) |
| Animations | Wanted, "proper high quality polished" (section 7) |
| Neapolitan ball weight | About 250 g. Done on 2026-11-22: the preset is 0.08 (248 g at 30 cm), live in commit `7e1d1cd` |
| Phone testing before go-live | Cloudflare preview URLs (section 10) |

Everything else in this document is the builder's call and is open to correction.

## 10. Preview and rollout

- Work happens on a branch. `main` deploys to the live site on push, so nothing merges without the
  owner's word.
- Preview address (owner decision): add `"preview_urls": true` to `wrangler.jsonc` and deploy it; then
  turn on preview builds for non-production branches in Workers Builds (Cloudflare dashboard, the
  Worker's build settings; the preview command is `npx wrangler preview`, Wrangler 4.135.0 or newer).
  The dashboard step may need the owner. Each branch then gets a stable `workers.dev` address that serves
  the real `_headers`.
- What the Cloudflare docs say about those addresses (read 2026-11-22, not yet tried on this Worker):
  they are public to anyone who has the link unless Cloudflare Access is put in front, and Cloudflare
  adds `X-Robots-Tag: noindex` to `workers.dev` preview addresses by itself, so search engines do not
  index a second copy of the site.
- Order: build on the branch, desktop checks, owner tests on real phones at the preview address, owner
  says merge, then verify the live site (bundle, headers, a deep link) as after every push.
