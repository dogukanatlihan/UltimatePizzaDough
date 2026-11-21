import { PIZZA_STYLES } from '../utils/doughCalculator';
import { useTranslation } from '../context/TranslationContext';
import { RANGES, clamp, sizeBounds } from '../utils/ranges';
import { formatGrams, lengthNumber } from '../utils/format';
import type { Calc } from './TrePassi';
import { Counter, RangeField, Segmented } from './controls';

export const crustKey = (tf: number) => (tf <= 0.06 ? 'crust.thin' : tf <= 0.09 ? 'crust.medium' : tf <= 0.12 ? 'crust.thick' : 'crust.extraThick');

export function StepSize({ calc }: { calc: Calc }) {
  const { t, language } = useTranslation();
  const { inputs } = calc;
  const style = PIZZA_STYLES.find((s) => s.id === inputs.pizzaStyle);
  const bounds = sizeBounds(inputs.useInches);
  const unit = inputs.useInches ? '″' : ' cm';
  const len = (v: number) => `${lengthNumber(v, language)}${unit}`;
  // One press moves a size by 1 in the unit on screen (11.8″ goes to 12″, then 13″).
  const nudge = (v: number, dir: number, [min, max]: readonly [number, number]) => clamp(Math.round(v) + dir, min, max);
  const labels = { lessLabel: t('a11y.less'), moreLabel: t('a11y.more') };
  const [minPizzas, maxPizzas] = RANGES.numberOfPizzas;
  const w = inputs.panWidth ?? bounds.pan[0];
  const l = inputs.panLength ?? bounds.pan[0];

  return (
    <>
      <div className="block">
        <Counter
          label={t('size.pizzas')}
          text={inputs.numberOfPizzas}
          onLess={() => calc.handleInputChange('numberOfPizzas', clamp(inputs.numberOfPizzas - 1, minPizzas, maxPizzas))}
          onMore={() => calc.handleInputChange('numberOfPizzas', clamp(inputs.numberOfPizzas + 1, minPizzas, maxPizzas))}
          lessDisabled={inputs.numberOfPizzas <= minPizzas}
          moreDisabled={inputs.numberOfPizzas >= maxPizzas}
          {...labels}
        />
      </div>

      <div className="block stack">
        {style?.isRectangular === 'both' && (
          <Segmented
            label={t('size.shape')}
            value={inputs.isRectangular ? 'rect' : 'round'}
            options={[{ value: 'rect', label: t('size.rectPan') }, { value: 'round', label: t('form.round') }]}
            onChange={(v) => calc.handleShapeToggle(v === 'rect')}
          />
        )}
        {inputs.isRectangular ? (
          <div className="pair">
            <Counter label={t('size.panWidth')} text={len(w)} onLess={() => calc.handlePanDimensionsChange(nudge(w, -1, bounds.pan), l)} onMore={() => calc.handlePanDimensionsChange(nudge(w, 1, bounds.pan), l)}
              lessDisabled={w <= bounds.pan[0]} moreDisabled={w >= bounds.pan[1]} {...labels} />
            <Counter label={t('size.panLength')} text={len(l)} onLess={() => calc.handlePanDimensionsChange(w, nudge(l, -1, bounds.pan))} onMore={() => calc.handlePanDimensionsChange(w, nudge(l, 1, bounds.pan))}
              lessDisabled={l <= bounds.pan[0]} moreDisabled={l >= bounds.pan[1]} {...labels} />
          </div>
        ) : (
          <Counter label={t('size.diameter')} text={len(inputs.pizzaDiameter)}
            onLess={() => calc.handlePizzaDiameterChange(nudge(inputs.pizzaDiameter, -1, bounds.diameter))}
            onMore={() => calc.handlePizzaDiameterChange(nudge(inputs.pizzaDiameter, 1, bounds.diameter))}
            lessDisabled={inputs.pizzaDiameter <= bounds.diameter[0]} moreDisabled={inputs.pizzaDiameter >= bounds.diameter[1]} {...labels} />
        )}
        <Segmented
          label={t('size.measureIn')}
          value={inputs.useInches ? 'in' : 'cm'}
          options={[{ value: 'cm', label: t('units.centimeters') }, { value: 'in', label: t('units.inches') }]}
          onChange={(v) => calc.handleUseInchesChange(v === 'in')}
        />
      </div>

      <div className="block">
        <RangeField
          label={t('crust.label')}
          value={inputs.thicknessFactor}
          range={RANGES.thicknessFactor}
          onChange={calc.handleThicknessFactorChange}
          valueText={t(crustKey(inputs.thicknessFactor))}
          ends={[t('crust.thin'), t('crust.thick')]}
          note={t('crust.ball', { g: formatGrams(inputs.ballWeight, { locale: language }) })}
        />
      </div>
    </>
  );
}
