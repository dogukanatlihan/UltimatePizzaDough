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

const sentenceCase = (text: string) => text.charAt(0).toLocaleUpperCase() + text.slice(1).toLocaleLowerCase();

const yeastLabel = (recipe: DoughRecipe, t: Translate): string => {
  const name = recipe.ingredients.find((i) => ingredientKey(i.name) === 'yeast')?.name.toLowerCase() ?? '';
  const type = name.includes('fresh') ? 'form.fresh' : name.includes('active') ? 'form.active' : 'form.instant';
  return sentenceCase(`${t(type)} ${t('ingredient.yeast')}`);
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

export const methodStages = (recipe: DoughRecipe, t: Translate, locale: string): Stage[] => {
  // {flour} and {flourOz} style placeholders: the strings already carry the "g" and "oz" units.
  const w = (name: string, g: number, yeast = false) => ({ [name]: gramsNumber(g, { yeast, locale }), [`${name}Oz`]: ouncesNumber(g, locale) });
  const finish = [4, 5, 6, 7, 8].map((n) => t(`mainDough.step${n}`));
  const { preferment: first, mainDough: main } = recipe;

  if (!first || !main) {
    const extra = (key: IngredientKey, name: string) => (weightOf(recipe, key) > 0 ? [t(`dough.step3.${name}`, w(name, weightOf(recipe, key)))] : []);
    return [{
      title: t('dough.instructions'),
      time: t('time.dough'),
      steps: [
        t('dough.step1', { ...w('water', weightOf(recipe, 'water')), ...w('flour', weightOf(recipe, 'flour')) }),
        t('dough.step2'),
        t('dough.step3.salt', w('salt', weightOf(recipe, 'salt'))),
        ...(weightOf(recipe, 'yeast') > 0 ? [t('dough.step3.yeast', { ...w('yeast', weightOf(recipe, 'yeast'), true), yeastName: yeastLabel(recipe, t).toLocaleLowerCase() })] : []),
        ...extra('oil', 'oil'), ...extra('sugar', 'sugar'), ...extra('malt', 'malt'), ...extra('enhancer', 'enhancer'),
        ...finish,
      ],
    }];
  }

  const sponge = recipe.prefermentType === 'sponge';
  const kind = sponge ? 'sponge' : 'poolish';
  const part = (name: string, g: number | undefined, yeast = false) => (g !== undefined && g > 0.004 ? t(`mainDough.step3.${name}`, w(name, g, yeast)) : '');
  return [
    {
      title: t('preferment.instructions'),
      time: t(sponge ? 'time.sponge' : 'time.poolish'),
      steps: [
        t('preferment.step1', {
          ...w('flour', first.flour), ...w('water', first.water),
          yeast: first.yeast !== undefined && first.yeast > 0.004 ? t('preferment.step1.yeast', w('yeast', first.yeast, true)) : '',
        }),
        t(`preferment.step2.${kind}`),
        t(`preferment.step3.${kind}`),
      ],
    },
    {
      title: t('mainDough.instructions'),
      time: t('time.dough'),
      steps: [
        t('mainDough.step1', w('water', main.water)),
        t('mainDough.step2', w('flour', main.flour)),
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
    time: time ? `${time.from}–${time.to} ${t(`unit.${time.unit}`)}` : '',
    flour: has(`flour.${styleId}`) ? t(`flour.${styleId}`) : null,
    steps: [1, 2, 3, 4].map((n) => (has(`baking.step${n}.${styleId}`) ? t(`baking.step${n}.${styleId}`) : t(`baking.step${n}`))),
  };
};

export const copyText = (recipe: DoughRecipe, inputs: DoughCalculatorInputs, t: Translate, locale: string): string => {
  const line = (r: Row) => `• ${r.label}: ${formatGrams(r.g, { yeast: r.key === 'yeast', locale })}${r.pct === undefined ? '' : ` (${formatPercent(r.pct, locale)})`}`;
  const stages = stageRows(recipe, t);
  return [
    `${t(`style.${inputs.pizzaStyle}`)} — ${inputs.numberOfPizzas} × ${formatGrams(inputs.ballWeight, { locale })} (${sizeText(inputs, locale)})`,
    t('copy.hydration', { pct: formatPercent(inputs.hydration, locale) }),
    '',
    ...ingredientRows(recipe, t).map(line),
    '',
    `${t('recipe.totalDough')}: ${formatGrams(totalDough(recipe), { locale })}`,
    ...(stages ? ['', t('stage.dayBefore', { name: stages.name }), ...stages.first.map(line), '', t('stage.bakingDay'), ...stages.main.map(line)] : []),
  ].join('\n');
};
