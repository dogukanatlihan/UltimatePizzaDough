import type { DoughRecipe, PrefermentType, YeastType } from '../types';
import { useTranslation } from '../context/TranslationContext';
import { RANGES } from '../utils/ranges';
import { formatGrams, formatPercent } from '../utils/format';
import type { Calc } from './TrePassi';
import { Disclosure, RangeField, Segmented } from './controls';
import { prefermentName, weightOf, type IngredientKey } from './recipeText';

const feelKey = (hydration: number) =>
  hydration < 60 ? 'water.feel.firm' : hydration <= 68 ? 'water.feel.classic' : hydration <= 75 ? 'water.feel.soft' : 'water.feel.wet';

/** Water, fine-tuning and preferment. Every slider shows the weight it produces, so its effect is on screen while it moves. */
export function Tuning({ calc, recipe }: { calc: Calc; recipe: DoughRecipe }) {
  const { t, language } = useTranslation();
  const { inputs } = calc;
  const pct = (v: number) => formatPercent(v, language);
  const both = (percent: number, key: IngredientKey) =>
    `${pct(percent)} · ${formatGrams(weightOf(recipe, key), { yeast: key === 'yeast', locale: language })}`;
  const share = (percent: number, grams: number | undefined) => `${pct(percent)} · ${formatGrams(grams ?? 0, { locale: language })}`;
  const set = (name: string) => (v: number) => calc.handleInputChange(name, v);
  const hasPreferment = inputs.preferment.type !== 'none';

  return (
    <>
      <div className="block">
        <RangeField
          label={t('water.label')}
          value={inputs.hydration}
          range={RANGES.hydration}
          onChange={set('hydration')}
          valueText={both(inputs.hydration, 'water')}
          ends={[t('water.firmer'), t('water.wetter')]}
          note={t(feelKey(inputs.hydration))}
        />
      </div>

      <Disclosure title={t('tune.title')} subtitle={t('tune.sub')}>
        <RangeField label={t('form.salt')} value={inputs.salt} range={RANGES.salt} onChange={set('salt')} valueText={both(inputs.salt, 'salt')} />
        <RangeField label={t('form.yeast')} value={inputs.yeast} range={inputs.yeastType === 'fresh' ? RANGES.yeastFresh : RANGES.yeast}
          onChange={set('yeast')} valueText={both(inputs.yeast, 'yeast')} />
        <Segmented<YeastType>
          label={t('form.yeastType')}
          value={inputs.yeastType}
          options={[{ value: 'instant', label: t('form.instant') }, { value: 'active_dry', label: t('form.active') }, { value: 'fresh', label: t('form.fresh') }]}
          onChange={calc.handleYeastTypeChange}
        />
        <RangeField label={t('form.oil')} value={inputs.oil} range={RANGES.oil} onChange={set('oil')} valueText={both(inputs.oil, 'oil')} />
        <RangeField label={t('form.sugar')} value={inputs.sugar} range={RANGES.sugar} onChange={set('sugar')} valueText={both(inputs.sugar, 'sugar')} />
        <RangeField label={t('form.diastaticMalt')} value={inputs.diastaticMalt} range={RANGES.diastaticMalt} onChange={set('diastaticMalt')} valueText={both(inputs.diastaticMalt, 'malt')} />
        <RangeField label={t('form.doughEnhancer')} value={inputs.doughEnhancer} range={RANGES.doughEnhancer} onChange={set('doughEnhancer')} valueText={both(inputs.doughEnhancer, 'enhancer')} />
      </Disclosure>

      <Disclosure
        title={t('form.preferment')}
        subtitle={hasPreferment ? t('pref.sub.on', { name: prefermentName(inputs.preferment.type, t), pct: pct(inputs.preferment.percentage) }) : t('pref.sub.none')}
      >
        <Segmented<PrefermentType>
          label={t('pref.type')}
          value={inputs.preferment.type}
          options={(['none', 'poolish', 'biga', 'sponge', 'sourdough'] as const).map((type) => ({ value: type, label: t(`form.${type}`) }))}
          onChange={calc.handlePrefermentTypeChange}
        />
        {hasPreferment && (
          <>
            <RangeField label={t('pref.share')} value={inputs.preferment.percentage} range={RANGES.prefermentPercentage}
              onChange={calc.handlePrefermentPercentageChange} valueText={share(inputs.preferment.percentage, recipe.preferment?.flour)} />
            <RangeField label={t('pref.water')} value={inputs.preferment.hydration} range={RANGES.prefermentHydration}
              onChange={calc.handlePrefermentHydrationChange} valueText={share(inputs.preferment.hydration, recipe.preferment?.water)} note={t('pref.hint')} />
          </>
        )}
      </Disclosure>
    </>
  );
}
