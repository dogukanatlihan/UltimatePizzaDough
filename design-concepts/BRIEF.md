# Make Better Pizza — design concept brief

We are redesigning **makebetter.pizza**, a pizza dough calculator. You build ONE clickable concept
mockup as a single HTML file. It is a throwaway design spike, not product code. Five concepts will be
shown side by side; yours must be clearly different from the others in how it is used and how it looks.

## The owner's words

- Today's site "doesn't feel polished and intuitive, and looks outdated".
- The new design must feel **modern and traditional both**.
- **Completely responsive and mobile compatible.**
- **Most of all: easy to use and intuitive.**

Target user: a first-time home baker on a phone gets a good recipe in about three taps. An enthusiast's
percentages are one tap away, never in the way.

## What is wrong with today's design (do not repeat)

- On a phone the recipe sits below a long form. You move a slider and the result is off-screen.
- Eight percentage sliders show at once for everyone.
- Inputs without labels. Two buttons that do the same thing. Heavy images.

## Files you may use (do not edit them)

- `calc.js` — all dough maths and text. Load with `<script src="calc.js"></script>`. Read it first.
  - `Dough.STYLES` (6 styles: name, hint, blurb, img, shape, bakeTemp, bakeTime, flour)
  - `Dough.defaults(styleId)` gives a state. Lengths in state are always cm; `state.units` is `'cm'` or `'in'`.
  - Change state ONLY like this: spread for plain fields (`{...st, hydration: 62}`), and
    `Dough.setStyle(st, id)`, `Dough.setYeastType(st, type)`, `Dough.setPreferment(st, type)` for those three.
  - `Dough.calc(st)` gives `{ballWeight, totalDough, flour, ingredients[{key,name,pct,g}], stages|null, warnWater}`.
    `stages` = `{name, first[{key,name,g}], main[...]}` when a preferment is on.
  - `Dough.method(st, rec)` gives steps with real weights. `Dough.bake(st)` gives temp, time, flour tip, steps.
  - `Dough.fmtG(g, key)`, `Dough.fmtOz(g)`, `Dough.fmtLen(cm, units)`, `Dough.toDisp`, `Dough.fromDisp`,
    `Dough.sizeLabel(st)`, `Dough.copyText(st, rec)`, `Dough.RANGES` (min, max, step per field;
    use `yeastFresh` range when `yeastType === 'fresh'`).
- `img/neapolitan.jpg`, `newyork.jpg`, `sicilian.jpg`, `detroit.jpg`, `pan.jpg`, `focaccia.jpg` (720px photos).

## Must work (every concept)

1. Pick one of 6 styles. Picking a style loads its presets.
2. Number of pizzas. Size: diameter for round styles; pan width × length for rectangular ones
   (`st.shape === 'rect'`). Focaccia (`style.shape === 'both'`) gets a round / rectangular choice.
3. Units switch cm ↔ inches (display only; convert input with `Dough.fromDisp`).
4. Thickness (`tf`, thin ↔ thick). Show the resulting ball weight.
5. Basics always reachable: hydration. Fine-tuning one tap away, hidden by default: salt, yeast %,
   yeast type (instant / active dry / fresh), oil, sugar, malt, enhancer.
6. Preferment: none / poolish / biga / sponge / sourdough, plus its % and hydration when on.
   Show the warning when `rec.warnWater` is true.
7. Recipe: every ingredient with grams (ounces as secondary) and baker's %; total dough; ball weight.
   With a preferment, show the two stages (`rec.stages.first`, `rec.stages.main`).
8. Method steps and bake info (temperature, time, flour tip).
9. One "Copy recipe" button (`navigator.clipboard.writeText(Dough.copyText(st, rec))` inside the click
   handler; catch failure; show "Copied" feedback in the page, no `alert()`).
10. The recipe updates live on every change, and **on a phone the key numbers stay visible while a
    control is being changed**.

Not in scope: saved recipes, accounts, Turkish language, printing, analytics, dark/light toggle.

## Hard rules

- ONE self-contained file: own `<!doctype html>`, `<meta charset>`, `<meta name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover">`, inline `<style>` and `<script>`.
  No frameworks, no build, no external JS. Fonts only via a Google Fonts `<link>` with a real fallback stack.
- No `localStorage`, no `fetch`, no `alert/confirm/prompt`, no `window.print`, no external images.
- Works from 360px to 1440px wide. The page never scrolls sideways. Use layout that reflows, not a
  scaled-down desktop page. It will be viewed inside an iframe 390px wide and one 1280px wide.
- Touch targets at least 44px. Inputs have 16px text or larger and a real `<label>` or `aria-label`.
  Visible keyboard focus. Pinch zoom allowed. Respect `prefers-reduced-motion`.
- Semantic HTML: `<button>` for actions, `<input type="range">` / number inputs for values, headings in order.
- Define colours and fonts once as CSS custom properties on `:root`. Use `font-variant-numeric: tabular-nums` for numbers.
- Real content only. No lorem ipsum, no emoji as icons, no fake features.
- Polished means: consistent spacing scale, aligned baselines, one accent used with restraint,
  clear hover / pressed / focus / selected states, smooth 150–250ms transitions.
- Avoid the looks every AI-made site has: cream background + serif + terracotta; near-black with one
  neon accent; purple-blue gradients; everything centred; the same rounded shadow card everywhere.

## When you are done

- Open your file's logic mentally at 360px and 1280px and fix overflow.
- Check the script has no syntax errors: `node --check` will not run HTML, so extract nothing; just re-read it.
- Do not create other files. Do not touch `calc.js`, `img/`, this brief, or anything outside this folder.
- End with a 5-line note: the idea, the interaction model, fonts, palette, known gaps.
