import { useState } from 'react';
import type { DoughRecipe } from '../types';
import { useTranslation } from '../context/TranslationContext';
import { Disclosure } from './controls';
import { bakeInfo, methodStages } from './recipeText';

interface Props {
  recipe: DoughRecipe;
  styleId: string;
  /** Resolves true when the recipe reached the clipboard. */
  onCopy: () => Promise<boolean>;
  onPrint: () => void;
}

export function Guide({ recipe, styleId, onCopy, onPrint }: Props) {
  const { t, language } = useTranslation();
  const [copied, setCopied] = useState(false);
  const stages = methodStages(recipe, t, language);
  const bake = bakeInfo(styleId, t);

  const copy = async () => {
    if (await onCopy()) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <>
      <Disclosure title={t('method.title')} subtitle={t(stages.length > 1 ? 'method.two' : 'method.one')} defaultOpen>
        {stages.map((stage) => (
          <div className="how" key={stage.title}>
            <h4>{stage.title}<span>{stage.time}</span></h4>
            <ol>{stage.steps.map((step, i) => <li key={i}>{step}</li>)}</ol>
          </div>
        ))}
      </Disclosure>

      <Disclosure title={t('bake.title')} subtitle={`${bake.temp.split(' / ')[0]} · ${bake.time}`}>
        <dl className="facts">
          <div><dt>{t('bake.oven')}</dt><dd className="num">{bake.temp}</dd></div>
          <div><dt>{t('bake.time')}</dt><dd className="num">{bake.time}</dd></div>
        </dl>
        {bake.flour && <p className="tip">{bake.flour}</p>}
        <div className="how"><ol>{bake.steps.map((step, i) => <li key={i}>{step}</li>)}</ol></div>
      </Disclosure>

      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={copy}>{copied ? t('action.copied') : t('action.copy')}</button>
        <button type="button" className="btn" onClick={onPrint}>{t('action.print')}</button>
      </div>
    </>
  );
}
