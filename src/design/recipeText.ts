// Turns a recipe into words. The card, the method, the bottom bar and "Copy recipe" all read weights
// through the same formatter here, so they can never disagree.
import type { DoughCalculatorInputs, DoughRecipe } from '../types';
import type { Translate } from '../context/translations';
import { formatGrams, formatPercent, gramsNumber, lengthNumber, ouncesNumber } from '../utils/format';
import { BAKE_TEMP, BAKE_TIME } from './styleMeta';

export type IngredientKey = 'flour' | 'water' | 'salt' | 'yeast' | 'oil' | 'sugar' | 'malt' | 'enhancer';
export interface Row { key: IngredientKey; label: string; g: number; pct?: number }
export interface Stage { title: string; time: string; steps: string[] }

const KEYS: IngredientKey[] = ['flour', 'water', 'salt', 'yeast', 'oil', 'sugar', 'malt', 'enhancer'];
const LABEL_KEY: Record<IngredientKey, string> = {
  flour: 'ingredient.flour', water: 'ingredient.water', salt: 'ingredient.salt', yeast: 'ingredient.yeast',
  oil: 'ingredient.oil', sugar: 'ingredient.sugar', malt: 'ingredient.diastaticMalt', enhancer: 'ingredient.doughEnhancer',
};

// The calculator names ingredients in English ("Instant Yeast", "Diastatic Malt"); map them to stable keys.
export const ingredientKey = (name: string): IngredientKey =>
  KEYS.find((k) => name.toLowerCase().includes(k)) ?? 'flour';

// Plain toLowerCase on purpose: toLocaleLowerCase follows the computer's language, and a Turkish system turns "Instant" into "ınstant".
const sentenceCase = (text: string) => text.charAt(0) + text.slice(1).toLowerCase();

const yeastLabel = (recipe: DoughRecipe, t: Translate): string => {
  const name = recipe.ingredients.find((i) => ingredientKey(i.name) === 'yeast')?.name.toLowerCase() ?? '';
  const type = ['fresh', 'active'].find((kind) => name.includes(kind)) ?? 'instant';
  return sentenceCase([t(`form.${type}`), t('ingredient.yeast')].join(' '));
};

const label = (key: IngredientKey, recipe: DoughRecipe, t: Translate) =>
  key === 'yeast' ? yeastLabel(recipe, t) : t(LABEL_KEY[key]);

export const weightOf = (recipe: DoughRecipe, key: IngredientKey): number =>
  recipe.ingredients.find((i) => ingredientKey(i.name) === key)?.weight ?? 0;

export const totalDough = (recipe: DoughRecipe): number => recipe.ingredients.reduce((sum, i) => sum + i.weight, 0);

export const ingredientRows = (recipe: DoughRecipe, t: Translate): Row[] =>
  recipe.ingredients.map((i) => {
    const key = ingredientKey(i.name);
    return { key, label: label(key, recipe, t), g: i.weight, pct: i.percentage };
  });

export const prefermentName = (type: string | undefined, t: Translate): string =>
  t(type === 'poolish' || type === 'biga' || type === 'sponge' || type === 'sourdough' ? `form.${type}` : 'form.preferment');

/** The two-stage split, or null when the dough is made in one stage. */
export const stageRows = (recipe: DoughRecipe, t: Translate): { name: string; first: Row[]; main: Row[] } | null => {
  const { preferment: first, mainDough: main } = recipe;
  if (!first || !main) return null;
  const row = (key: IngredientKey, g: number | undefined): Row[] => (g !== undefined && g > 0.004 ? [{ key, label: label(key, recipe, t), g }] : []);
  return {
    name: prefermentName(recipe.prefermentType, t),
    first: [...row('flour', first.flour), ...row('water', first.water), ...row('yeast', first.yeast)],
    // Water can go negative with a very large preferment; the row stays so the warning has something to point at.
    main: [...row('flour', main.flour), { key: 'water', label: label('water', recipe, t), g: main.water }, ...row('salt', main.salt), ...row('yeast', main.yeast),
      ...row('oil', main.oil), ...row('sugar', main.sugar), ...row('malt', main.diastaticMalt), ...row('enhancer', main.doughEnhancer)],
  };
};

export const sizeText = (inputs: DoughCalculatorInputs, locale: string): string => {
  const unit = inputs.useInches ? '″' : ' cm';
  const n = (value: number | undefined) => lengthNumber(value ?? 0, locale);
  return inputs.isRectangular ? `${n(inputs.panWidth)} × ${n(inputs.panLength)}${unit}` : `${n(inputs.pizzaDiameter)}${unit}`;
};

// First key that has a string: a style's own wording, then the shared one.
const pickKey = (t: Translate, ...keys: string[]): string => keys.find((key) => t(key) !== key) ?? keys[keys.length - 1];
const pick = (t: Translate, ...keys: string[]): string => t(pickKey(t, ...keys));

const IN_PAN = new Set(['sicilian', 'detroit', 'pan', 'focaccia']);

// How each style goes from mixed dough to oven-ready, as its sources prescribe:
// Neapolitan — AVPN/EU direct method, risen at room temperature, no refrigerator.
// New York — Lehmann: balled straight after mixing, then 1-3 days cold.
// Pan styles — folds, one piece per pan, 1-3 days cold, then a final rise in the oiled pan.
const finishKeys = (styleId: string): string[] => {
  if (styleId === 'neapolitan') return ['knead', 'rest', 'balls', 'proof'].map((k) => `method.neapolitan.${k}`);
  if (styleId === 'ny') return ['knead', 'balls', 'cold', 'temper'].map((k) => `method.ny.${k}`);
  if (IN_PAN.has(styleId)) return ['mainDough.step4', 'method.pan.piece', 'method.pan.cold', `method.pan.proof.${styleId}`];
  return [4, 5, 6, 7, 8].map((n) => `mainDough.step${n}`);
};

export const methodStages = (recipe: DoughRecipe, t: Translate, locale: string, styleId = ''): Stage[] => {
  // {flour} and {flourOz} style placeholders: the strings already carry the "g" and "oz" units.
  const w = (name: string, g: number, yeast = false) => ({ [name]: gramsNumber(g, { yeast, locale }), [`${name}Oz`]: ouncesNumber(g, locale) });
  const finish = finishKeys(styleId).map((key) => t(key));
  const time = pick(t, `time.dough.${styleId}`, 'time.dough');
  const { preferment: first, mainDough: main } = recipe;

  if (!first || !main) {
    const extra = (key: IngredientKey, name: string) => (weightOf(recipe, key) > 0 ? [t(`dough.step3.${name}`, w(name, weightOf(recipe, key)))] : []);
    const yeast = weightOf(recipe, 'yeast') > 0 ? [t('dough.step3.yeast', { ...w('yeast', weightOf(recipe, 'yeast'), true), yeastName: yeastLabel(recipe, t).toLowerCase() })] : [];
    const extras = [...extra('oil', 'oil'), ...extra('sugar', 'sugar'), ...extra('malt', 'malt'), ...extra('enhancer', 'enhancer')];
    const vars = { ...w('water', weightOf(recipe, 'water')), ...w('flour', weightOf(recipe, 'flour')), ...w('salt', weightOf(recipe, 'salt')) };
    return [{
      title: t('dough.instructions'),
      time,
      // AVPN's direct method: salt dissolved in the water, a tenth of the flour, the yeast, then the rest of the flour. No autolyse.
      steps: styleId === 'neapolitan'
        ? [t('dough.direct.step1', vars), t('dough.direct.step2', vars), ...yeast, ...extras, t('dough.direct.step3'), ...finish]
        : [t('dough.step1', vars), t('dough.step2'), t('dough.step3.salt', vars), ...yeast, ...extras, ...finish],
    }];
  }

  // Poolish and biga share their wording; a sponge is quicker; a sourdough is built from a ripe starter.
  const kind = recipe.prefermentType === 'sponge' || recipe.prefermentType === 'sourdough' ? recipe.prefermentType : 'poolish';
  const part = (name: string, g: number | undefined, yeast = false) => (g !== undefined && g > 0.004 ? t(`mainDough.step3.${name}`, w(name, g, yeast)) : '');
  return [
    {
      title: t('preferment.instructions'),
      time: t(`time.${kind}`),
      steps: [
        t(pickKey(t, `preferment.step1.${kind}`, 'preferment.step1'), {
          ...w('flour', first.flour), ...w('water', first.water),
          yeast: first.yeast !== undefined && first.yeast > 0.004 ? t('preferment.step1.yeast', w('yeast', first.yeast, true)) : '',
        }),
        t(`preferment.step2.${kind}`),
        pick(t, `preferment.step3.${kind}`, 'preferment.step3.poolish'),
      ],
    },
    {
      title: t('mainDough.instructions'),
      time,
      steps: [
        t('mainDough.step1', w('water', main.water)),
        // Neapolitan stays a direct dough: no autolyse rest, with or without a preferment.
        t(pickKey(t, `mainDough.step2.${styleId}`, 'mainDough.step2'), w('flour', main.flour)),
        t('mainDough.step3.start', w('salt', main.salt)) + part('yeast', main.yeast, true) + part('oil', main.oil) + part('sugar', main.sugar)
          + part('malt', main.diastaticMalt) + part('enhancer', main.doughEnhancer) + t('mainDough.step3.end'),
        ...finish,
      ],
    },
  ];
};

export const bakeInfo = (styleId: string, t: Translate): { temp: string; time: string; flour: string | null; steps: string[] } => {
  const has = (key: string) => t(key) !== key;
  const time = BAKE_TIME[styleId];
  return {
    temp: BAKE_TEMP[styleId] ?? '',
    time: time ? [`${time.from}–${time.to}`, t(`unit.${time.unit}`)].join(' ') : '',
    flour: has(`flour.${styleId}`) ? t(`flour.${styleId}`) : null,
    // A style's own step, then the step shared by the styles that rise in their pan, then the general one.
    steps: [1, 2, 3, 4].map((n) => pick(t, `baking.step${n}.${styleId}`, ...(IN_PAN.has(styleId) ? [`baking.step${n}.inPan`] : []), `baking.step${n}`)),
  };
};

export const copyText = (recipe: DoughRecipe, inputs: DoughCalculatorInputs, t: Translate, locale: string): string => {
  const line = (r: Row) => {
    const weight = formatGrams(r.g, { yeast: r.key === 'yeast', locale });
    return r.pct === undefined ? `• ${r.label}: ${weight}` : `• ${r.label}: ${weight} (${formatPercent(r.pct, locale)})`;
  };
  const stages = stageRows(recipe, t);
  return [
    [t(`style.${inputs.pizzaStyle}`), '—', inputs.numberOfPizzas, '×', formatGrams(inputs.ballWeight, { locale }), `(${sizeText(inputs, locale)})`].join(' '),
    t('copy.hydration', { pct: formatPercent(inputs.hydration, locale) }),
    '',
    ...ingredientRows(recipe, t).map(line),
    '',
    [`${t('recipe.totalDough')}:`, formatGrams(totalDough(recipe), { locale })].join(' '),
    ...(stages ? ['', t('stage.dayBefore', { name: stages.name }), ...stages.first.map(line), '', t('stage.bakingDay'), ...stages.main.map(line)] : []),
  ].join('\n');
};
