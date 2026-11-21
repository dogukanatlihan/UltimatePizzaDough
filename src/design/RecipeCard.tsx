import type { DoughCalculatorInputs, DoughRecipe } from '../types';
import { useTranslation } from '../context/TranslationContext';
import { formatGrams, formatOunces, formatPercent } from '../utils/format';
import { STYLE_IMAGES, STYLE_IMAGE_SIZE, STYLE_TINT } from './styleMeta';
import { ingredientRows, sizeText, stageRows, totalDough, type Row } from './recipeText';

interface Props {
  recipe: DoughRecipe;
  inputs: DoughCalculatorInputs;
}

export function RecipeCard({ recipe, inputs }: Props) {
  const { t, language } = useTranslation();
  const stages = stageRows(recipe, t);
  const total = totalDough(recipe);

  const row = (r: Row) => (
    <div className="ing" key={r.key}>
      <span className="ing-name">{r.label}</span>
      <span className="ing-weight num">
        {formatGrams(r.g, { yeast: r.key === 'yeast', locale: language })}
        <small>{formatOunces(r.g, language)}</small>
      </span>
      {r.pct === undefined ? <span /> : <span className="ing-pct num">{formatPercent(r.pct, language)}</span>}
    </div>
  );

  return (
    <article className="recipe" aria-labelledby="recipe-name">
      <header className="recipe-head">
        <span className="recipe-photo" style={{ background: STYLE_TINT[inputs.pizzaStyle] }}>
          <img src={STYLE_IMAGES[inputs.pizzaStyle]} alt="" width={STYLE_IMAGE_SIZE} height={STYLE_IMAGE_SIZE} />
        </span>
        <div>
          <p className="recipe-name" id="recipe-name">{t(`style.${inputs.pizzaStyle}`)}</p>
          <p className="recipe-sub num">
            {inputs.numberOfPizzas} × {formatGrams(inputs.ballWeight, { locale: language })} · {sizeText(inputs, language)}
          </p>
        </div>
      </header>

      <div className="ing-list">{ingredientRows(recipe, t).map(row)}</div>
      <div className="ing ing-total">
        <span className="ing-name">{t('recipe.totalDough')}</span>
        <span className="ing-weight num">
          {formatGrams(total, { locale: language })}
          <small>{formatOunces(total, language)}</small>
        </span>
        <span />
      </div>

      {stages && (
        <>
          {recipe.mainDough && recipe.mainDough.water < 0 && <p className="warn" role="alert">{t('preferment.waterWarning')}</p>}
          <h3 className="stage-head">{t('stage.dayBefore', { name: stages.name })}</h3>
          <div className="ing-list">{stages.first.map(row)}</div>
          <h3 className="stage-head">{t('stage.bakingDay')}</h3>
          <div className="ing-list">{stages.main.map(row)}</div>
        </>
      )}
    </article>
  );
}
