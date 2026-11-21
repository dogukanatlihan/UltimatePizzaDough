/* Shared dough maths for the design concepts. Plain JS, no build. Exposes window.Dough.
   Ported from src/utils/doughCalculator.ts + src/hooks/useDoughCalculator.ts (same numbers as the live app).
   Lengths in state are ALWAYS centimetres; `units` only changes what the UI shows. */
(function () {
  const OZ = 28.3495, IN = 2.54;
  const YEAST_FACTOR = { active_dry: 1, instant: 0.75, fresh: 3 };
  const YEAST_NAMES = { active_dry: 'Active dry yeast', instant: 'Instant yeast', fresh: 'Fresh yeast' };
  const PREF_NAMES = { none: 'None', poolish: 'Poolish', biga: 'Biga', sponge: 'Sponge', sourdough: 'Sourdough' };
  const r1 = (n) => Math.round(n * 10) / 10, r2 = (n) => Math.round(n * 100) / 100;
  const P = (pct, hyd, yeast) => ({ pct, hyd, yeast });

  // Yeast numbers are instant-yeast amounts. shape: 'round' | 'rect' | 'both'.
  const STYLES = [
    { id: 'neapolitan', name: 'Neapolitan', hint: 'Wood-fired · 60s bake', blurb: 'Thin centre, puffy airy rim.', img: 'img/neapolitan.jpg',
      shape: 'round', d: 30, w: 30, l: 40, tf: 0.08, hydration: 60, salt: 2.8, yeast: 0.05, oil: 0, sugar: 0, malt: 0, enhancer: 0,
      bakeTemp: '500°C / 932°F', bakeTime: '60–90 s', flour: 'Tipo 00, about 12.5% protein (Caputo Pizzeria or similar).',
      pref: { poolish: P(40, 100, 0.05), biga: P(50, 60, 0.05), sponge: P(50, 75, 0.05), sourdough: P(25, 100, 0) },
      bake: ['Heat a pizza oven to 425–485°C. In a home oven, heat a stone or steel at maximum for 1 hour.', 'Stretch by hand from the centre outward. Leave the rim untouched. No rolling pin.', 'Top lightly and slide onto the hot stone.', 'Bake until the rim is leopard-spotted: 60–90 s in a pizza oven, 5–7 min in a home oven.'] },
    { id: 'ny', name: 'New York', hint: 'Foldable · steel deck', blurb: 'Big foldable slices, crisp outside, chewy inside.', img: 'img/newyork.jpg',
      shape: 'round', d: 45, w: 30, l: 40, tf: 0.08, hydration: 65, salt: 2.25, yeast: 0.4, oil: 2, sugar: 1.5, malt: 0.75, enhancer: 0.4,
      bakeTemp: '290°C / 550°F', bakeTime: '8–10 min', flour: 'High-gluten bread flour, 14% protein or more.',
      pref: { poolish: P(40, 100, 0.3), biga: P(50, 60, 0.3), sponge: P(60, 75, 0.4), sourdough: P(30, 100, 0) },
      bake: ['Heat the oven to maximum (260–290°C) with a stone or steel for 1 hour.', 'Stretch gently to size. Keep the gas in the rim.', 'Add toppings and slide onto the hot stone or steel.', 'Bake until the crust is golden and the cheese bubbles, 8–10 min.'] },
    { id: 'sicilian', name: 'Sicilian', hint: 'Sheet pan · airy crumb', blurb: 'Thick rectangle, fluffy inside, crisp bottom.', img: 'img/sicilian.jpg',
      shape: 'rect', d: 30, w: 30, l: 46, tf: 0.12, hydration: 70, salt: 2.25, yeast: 0.5, oil: 3.5, sugar: 2, malt: 0.4, enhancer: 0.4,
      bakeTemp: '250°C / 480°F', bakeTime: '25–30 min', flour: 'Bread flour, 12–13% protein.',
      pref: { poolish: P(50, 100, 0.3), biga: P(50, 60, 0.3), sponge: P(65, 75, 0.4), sourdough: P(30, 100, 0) },
      bake: ['Heat the oven to 230–260°C. Oil a sheet pan well and let the dough proof in it.', 'Press the dough gently into the corners. Do not deflate it.', 'Add sauce and toppings. Cheese often goes on late or after the bake.', 'Bake 25–30 min until the bottom is crisp and the crust deep golden.'] },
    { id: 'detroit', name: 'Detroit', hint: 'Steel pan · cheese edge', blurb: 'Airy pan pizza with caramelised cheese edges.', img: 'img/detroit.jpg',
      shape: 'rect', d: 30, w: 25, l: 36, tf: 0.10, hydration: 68, salt: 2.25, yeast: 0.5, oil: 4, sugar: 1.5, malt: 0.75, enhancer: 0.5,
      bakeTemp: '260°C / 500°F', bakeTime: '12–15 min', flour: 'Bread flour, 12–13% protein.',
      pref: { poolish: P(45, 100, 0.3), biga: P(50, 60, 0.3), sponge: P(60, 75, 0.4), sourdough: P(25, 100, 0) },
      bake: ['Heat the oven to 260–290°C. Oil a Detroit steel pan or a dark deep pan well.', 'Press the dough into the pan and let it proof there.', 'Put cheese right up to the pan edges, then sauce in stripes on top.', 'Bake 12–15 min until the cheese edges are dark and crisp.'] },
    { id: 'pan', name: 'Pan', hint: 'Deep dish · fluffy', blurb: 'Thick fluffy crust, fried crisp in an oiled pan.', img: 'img/pan.jpg',
      shape: 'round', d: 30, w: 30, l: 40, tf: 0.11, hydration: 65, salt: 2.25, yeast: 0.5, oil: 5, sugar: 2, malt: 0.5, enhancer: 0.4,
      bakeTemp: '260°C / 500°F', bakeTime: '12–15 min', flour: 'Bread flour, 12–13% protein.',
      pref: { poolish: P(45, 100, 0.3), biga: P(50, 60, 0.3), sponge: P(60, 75, 0.4), sourdough: P(25, 100, 0) },
      bake: ['Heat the oven to 260°C. Oil a deep round pan or cast-iron skillet generously.', 'Press the dough into the pan and let it rise there.', 'Add sauce, cheese and toppings.', 'Bake on the lowest rack 12–15 min until deep golden with a fried, crisp bottom.'] },
    { id: 'focaccia', name: 'Focaccia', hint: 'High hydration · olive oil', blurb: 'Wet dough, open airy crumb, lots of olive oil.', img: 'img/focaccia.jpg',
      shape: 'both', d: 30, w: 23, l: 33, tf: 0.14, hydration: 80, salt: 2.5, yeast: 0.4, oil: 6, sugar: 0.5, malt: 0.4, enhancer: 0.1,
      bakeTemp: '230°C / 445°F', bakeTime: '20–25 min', flour: 'All-purpose or bread flour, 11–13% protein.',
      pref: { poolish: P(50, 100, 0.3), biga: P(60, 60, 0.25), sponge: P(65, 75, 0.35), sourdough: P(30, 100, 0) },
      bake: ['Heat the oven to 230°C. Oil the pan well.', 'Stretch the dough to fill the pan without deflating it.', 'Dimple with your fingers, pour on olive oil, scatter flaky salt.', 'Bake 20–25 min until the top is deep golden and crisp. Cool a little before cutting.'] },
  ];
  const style = (id) => STYLES.find((s) => s.id === id) || STYLES[0];
  const convertYeast = (pct, from, to) => r2(pct * YEAST_FACTOR[to] / YEAST_FACTOR[from]);

  /** Fresh state for a style. Keeps pizzas, units and yeast type from `prev` when given. */
  function defaults(id, prev) {
    const s = style(id), yt = prev ? prev.yeastType : 'instant';
    return { style: s.id, pizzas: prev ? prev.pizzas : (s.shape === 'round' ? 4 : 1), units: prev ? prev.units : 'cm',
      shape: s.shape === 'round' ? 'round' : 'rect', d: s.d, w: s.w, l: s.l, tf: s.tf,
      hydration: s.hydration, salt: s.salt, yeast: convertYeast(s.yeast, 'instant', yt), yeastType: yt,
      oil: s.oil, sugar: s.sugar, malt: s.malt, enhancer: s.enhancer, pref: { type: 'none', pct: 0, hyd: 100 } };
  }
  /** Each setter returns a NEW state. Use them so presets and conversions stay right. */
  const setStyle = (st, id) => defaults(id, st);
  const setYeastType = (st, t) => ({ ...st, yeast: convertYeast(st.yeast, st.yeastType, t), yeastType: t });
  function setPreferment(st, type) {
    const s = style(st.style);
    if (type === 'none') return { ...st, yeast: convertYeast(s.yeast, 'instant', st.yeastType), pref: { type, pct: 0, hyd: 100 } };
    const p = s.pref[type];
    return { ...st, yeast: convertYeast(p.yeast, 'instant', st.yeastType), pref: { type, pct: p.pct, hyd: p.hyd } };
  }

  const areaIn2 = (st) => st.shape === 'rect' ? (st.w / IN) * (st.l / IN) : Math.PI * Math.pow(st.d / IN / 2, 2);
  const ballWeight = (st) => Math.round(st.tf * areaIn2(st) * OZ);

  /** The whole recipe for a state. All weights in grams. */
  function calc(st) {
    const ball = ballWeight(st), total = ball * st.pizzas;
    const pcts = [['flour', 'Flour', 100], ['water', 'Water', st.hydration], ['salt', 'Salt', st.salt], ['yeast', YEAST_NAMES[st.yeastType], st.yeast],
      ['oil', 'Olive oil', st.oil], ['sugar', 'Sugar', st.sugar], ['malt', 'Diastatic malt', st.malt], ['enhancer', 'Dough enhancer', st.enhancer]];
    const flour = total / (pcts.reduce((a, p) => a + p[2], 0) / 100);
    const ingredients = pcts.filter((p) => p[2] > 0 || p[0] === 'yeast').map(([key, name, pct]) => ({ key, name, pct, g: flour * pct / 100 }));
    const g = (key) => (ingredients.find((i) => i.key === key) || { g: 0 }).g;
    const out = { ballWeight: ball, totalDough: total, flour, ingredients, stages: null, warnWater: false };
    if (st.pref.type !== 'none' && st.pref.pct > 0) {
      const pf = flour * st.pref.pct / 100, pw = pf * st.pref.hyd / 100;
      const py = st.pref.type === 'sourdough' ? 0 : Math.min(g('yeast'), flour * 0.001 * YEAST_FACTOR[st.yeastType]);
      const row = (key, name, grams) => ({ key, name, g: grams });
      out.stages = {
        name: PREF_NAMES[st.pref.type],
        first: [row('flour', 'Flour', pf), row('water', 'Water', pw)].concat(py > 0 ? [row('yeast', YEAST_NAMES[st.yeastType], py)] : []),
        main: [row('flour', 'Flour', flour - pf), row('water', 'Water', g('water') - pw), row('salt', 'Salt', g('salt')), row('yeast', YEAST_NAMES[st.yeastType], g('yeast') - py)]
          .concat(ingredients.filter((i) => ['oil', 'sugar', 'malt', 'enhancer'].includes(i.key)).map((i) => row(i.key, i.name, i.g)))
          .filter((x) => x.key !== 'yeast' || x.g > 0.004),
      };
      out.warnWater = g('water') - pw < 0;
    }
    return out;
  }

  // ---- formatting
  const fmtG = (g, key) => (key === 'yeast' || Math.abs(g) < 10 ? (Math.abs(g) < 1 ? r2(g) : r1(g)) : Math.round(g)) + ' g';
  const fmtOz = (g) => { const oz = g / OZ; return oz.toFixed(Math.abs(oz) < 1 ? 2 : 1) + ' oz'; };
  const toDisp = (cm, units) => units === 'in' ? r1(cm / IN) : r1(cm);
  const fromDisp = (v, units) => units === 'in' ? v * IN : v;
  const fmtLen = (cm, units) => toDisp(cm, units) + (units === 'in' ? '″' : ' cm');
  const sizeLabel = (st) => st.shape === 'rect' ? `${toDisp(st.w, st.units)} × ${fmtLen(st.l, st.units)}` : fmtLen(st.d, st.units);
  const list = (rows) => rows.map((x) => `${fmtG(x.g, x.key)} ${x.name.toLowerCase()}`).join(', ').replace(/, ([^,]*)$/, ' and $1');

  /** Method as [{title, time, steps[]}], with real weights in the text. */
  function method(st, rec) {
    const shape = ['Fold the dough 3–4 times, 30 minutes apart.', 'Let it rise until about 50% bigger, 2–4 hours at room temperature.',
      `Divide into ${st.pizzas} ${st.pizzas === 1 ? 'piece' : 'balls'} of ${rec.ballWeight} g and shape.`, 'Refrigerate covered for 24–72 hours.', 'Take out 1–2 hours before baking.'];
    if (!rec.stages) {
      const dry = rec.ingredients.filter((i) => !['flour', 'water'].includes(i.key));
      return [{ title: 'Make the dough', time: '30 min + proof', steps: [`Mix ${list(rec.ingredients.filter((i) => ['water', 'flour'].includes(i.key)).reverse())} until no dry flour is left.`,
        'Cover and rest 30 minutes.', `Add ${list(dry)} and mix well.`].concat(shape) }];
    }
    const sponge = st.pref.type === 'sponge';
    return [
      { title: `Day before: ${rec.stages.name.toLowerCase()}`, time: sponge ? '3–5 h' : '12–16 h', steps: [`Mix ${list(rec.stages.first)} until no dry flour is left.`,
        `Cover and leave at room temperature (20–22°C) for ${sponge ? '3–5' : '12–16'} hours.`, 'It is ready when domed and full of bubbles.'] },
      { title: 'Main dough', time: '30 min + proof', steps: [`Dissolve the ${rec.stages.name.toLowerCase()} in ${fmtG(rec.stages.main[1].g)} water.`,
        `Add ${fmtG(rec.stages.main[0].g)} flour, mix, cover and rest 30 minutes.`, `Add ${list(rec.stages.main.slice(2))} and mix well.`].concat(shape) },
    ];
  }
  const bake = (st) => { const s = style(st.style); return { temp: s.bakeTemp, time: s.bakeTime, flour: s.flour, steps: s.bake }; };
  function copyText(st, rec) {
    const s = style(st.style);
    return [`${s.name} — ${st.pizzas} × ${rec.ballWeight} g (${sizeLabel(st)})`, `Hydration ${st.hydration}%`, '',
      ...rec.ingredients.map((i) => `• ${i.name}: ${fmtG(i.g, i.key)} (${i.pct}%)`), '', `Total: ${Math.round(rec.totalDough)} g`].join('\n');
  }

  // Slider ranges every concept should use: [min, max, step].
  const RANGES = { pizzas: [1, 20, 1], d: [15, 60, 1], w: [10, 60, 1], l: [10, 60, 1], tf: [0.03, 0.15, 0.01], hydration: [50, 85, 1], salt: [1, 4, 0.1],
    yeast: [0, 2, 0.01], yeastFresh: [0, 6, 0.01], oil: [0, 10, 0.5], sugar: [0, 5, 0.5], malt: [0, 2, 0.1], enhancer: [0, 2, 0.1], prefPct: [10, 100, 5], prefHyd: [50, 125, 5] };

  window.Dough = { STYLES, YEAST_NAMES, PREF_NAMES, RANGES, style, defaults, setStyle, setYeastType, setPreferment, ballWeight, calc, method, bake,
    copyText, fmtG, fmtOz, fmtLen, toDisp, fromDisp, sizeLabel, convertYeast };
})();
