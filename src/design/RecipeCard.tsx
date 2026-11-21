import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { DoughCalculatorInputs, DoughRecipe } from '../types';
import { useTranslation } from '../context/TranslationContext';
import { formatGrams, formatOunces, formatPercent } from '../utils/format';
import { Photo } from './Photo';
import { Grams } from './Num';
import { ingredientRows, sizeText, stageRows, totalDough, type Row } from './recipeText';

interface Props {
  recipe: DoughRecipe;
  inputs: DoughCalculatorInputs;
}

export function RecipeCard({ recipe, inputs }: Readonly<Props>) {
  const { t, language } = useTranslation();
  const stages = stageRows(recipe, t);
  const total = totalDough(recipe);
  // Rows slide in and out and make room for each other (off for reduced motion, by the library).
  const rows = { duration: 220, easing: 'ease-out' };
  const [listRef] = useAutoAnimate(rows);
  const [firstRef] = useAutoAnimate(rows);
  const [mainRef] = useAutoAnimate(rows);

  const row = (r: Row) => (
    <div className="ing" key={r.key}>
      <span className="ing-name">{r.label}</span>
      <span className="ing-weight num">
        <Grams g={r.g} yeast={r.key === 'yeast'} />
        <small>{formatOunces(r.g, language)}</small>
      </span>
      {r.pct === undefined ? <span /> : <span className="ing-pct num">{formatPercent(r.pct, language)}</span>}
    </div>
  );

  return (
    <article className="recipe" aria-labelledby="recipe-name">
      <header className="recipe-head">
        <Photo styleId={inputs.pizzaStyle} className="recipe-photo" eager />
        <div>
          <p className="recipe-name" id="recipe-name">{t(`style.${inputs.pizzaStyle}`)}</p>
          <p className="recipe-sub num">
            {inputs.numberOfPizzas} × {formatGrams(inputs.ballWeight, { locale: language })} · {sizeText(inputs, language)}
          </p>
        </div>
      </header>

      <div className="ing-list" ref={listRef}>{ingredientRows(recipe, t).map(row)}</div>
      <div className="ing ing-total">
        <span className="ing-name">{t('recipe.totalDough')}</span>
        <span className="ing-weight num">
          <Grams g={total} />
          <small>{formatOunces(total, language)}</small>
        </span>
        <span />
      </div>

      {stages && (
        <>
          {recipe.mainDough && recipe.mainDough.water < 0 && <p className="warn" role="alert">{t('preferment.waterWarning')}</p>}
          <h3 className="stage-head">{t('stage.dayBefore', { name: stages.name })}</h3>
          <div className="ing-list" ref={firstRef}>{stages.first.map(row)}</div>
          <h3 className="stage-head">{t('stage.bakingDay')}</h3>
          <div className="ing-list" ref={mainRef}>{stages.main.map(row)}</div>
        </>
      )}
    </article>
  );
}
