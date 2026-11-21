import './design.css';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useDoughCalculator } from '../hooks/useDoughCalculator';
import { useTranslation } from '../context/TranslationContext';
import { useToast } from '../components/ToastProvider';
import AddToHomeButton from '../components/AddToHomeButton';
import { calculateDoughRecipe } from '../utils/doughCalculator';
import { formatGrams } from '../utils/format';
import { trackCopy, trackPrint, trackTabChange } from '../utils/analytics';
import { Header, STEP_KEYS, type Step } from './Header';
import { BottomBar } from './BottomBar';
import { StepStyle } from './StepStyle';
import { StepSize } from './StepSize';
import { RecipeCard } from './RecipeCard';
import { Tuning } from './Tuning';
import { Guide } from './Guide';
import { STYLE_IMAGES, STYLE_IMAGE_SIZE, STYLE_TINT } from './styleMeta';
import { copyText, sizeText, totalDough, weightOf } from './recipeText';

export type Calc = ReturnType<typeof useDoughCalculator>;

// From this width all three steps show side by side. Keep in step with design.css.
const WIDE = '(min-width: 1040px)';
const subscribeWide = (onChange: () => void) => {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
};
const useWide = () => useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches);

export function TrePassi() {
  const calc = useDoughCalculator();
  const { inputs } = calc;
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const wide = useWide();
  // A returning visitor lands on their recipe; a new one starts at the style.
  const [step, setStep] = useState<Step>(calc.restored ? 3 : 1);
  const headings = useRef<Partial<Record<Step, HTMLHeadingElement | null>>>({});
  const moved = useRef(false);
  // Computed here, not read from the hook's state, so the numbers never lag a render behind the control.
  const recipe = useMemo(() => calculateDoughRecipe(inputs), [inputs]);

  const goTo = (next: Step) => {
    moved.current = true;
    setStep(next);
    trackTabChange(STEP_KEYS[next].replace('step.', ''));
  };

  // After a step change: top of the page on phones, and focus on the new step's heading for keyboards and screen readers.
  useEffect(() => {
    if (!moved.current) return;
    const heading = headings.current[step];
    if (wide) heading?.scrollIntoView({ block: 'nearest' });
    else window.scrollTo({ top: 0 });
    heading?.focus({ preventScroll: true });
  }, [step, wide]);

  const pickStyle = (styleId: string) => {
    calc.handlePizzaStyleChange(styleId);
    if (!wide) goTo(2);
  };

  const copy = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(copyText(recipe, inputs, t, language));
      showToast(t('recipe.copied'), 'success');
      trackCopy();
      return true;
    } catch {
      // Clipboard is missing on insecure origins and can be denied.
      showToast(t('recipe.copyFailed'), 'error');
      return false;
    }
  };

  const print = () => {
    trackPrint();
    window.print();
  };

  const startOver = () => {
    const previous = calc.startOver();
    goTo(1);
    showToast(t('toast.startedOver'), 'info', {
      duration: 7000,
      action: { label: t('toast.undo'), onAction: () => { calc.restore(previous); goTo(3); } },
    });
  };

  const grams = (g: number) => formatGrams(g, { locale: language });
  const balls = `${inputs.numberOfPizzas} × ${grams(inputs.ballWeight)}`;
  const styleName = t(`style.${inputs.pizzaStyle}`);
  const head = (n: Step, title: string) => (
    <header className="step-head">
      <p className="kicker">{t('step.of', { n })}</p>
      <h2 id={`h-${n}`} tabIndex={-1} ref={(el) => { headings.current[n] = el; }}>{title}</h2>
    </header>
  );

  return (
    <div className="app">
      <Header step={step} onStep={goTo} />

      <main className="steps" data-step={step}>
        <section className="step" id="s1" aria-labelledby="h-1">
          {head(1, t('s1.title'))}
          <StepStyle value={inputs.pizzaStyle} onPick={pickStyle} />
        </section>

        <section className="step" id="s2" aria-labelledby="h-2">
          <button type="button" className="chip" onClick={() => goTo(1)}>
            <span className="chip-photo" style={{ background: STYLE_TINT[inputs.pizzaStyle] }}>
              <img src={STYLE_IMAGES[inputs.pizzaStyle]} alt="" width={STYLE_IMAGE_SIZE} height={STYLE_IMAGE_SIZE} />
            </span>
            <span className="chip-name">{styleName}</span>
            <span className="chip-change">{t('chip.change')}</span>
          </button>
          {head(2, t('s2.title'))}
          <StepSize calc={calc} />
        </section>

        <section className="step" id="tune" aria-label={t('tune.title')}>
          <Tuning calc={calc} recipe={recipe} />
        </section>

        <div className="col3">
          <section className="step" id="card" aria-labelledby="h-3">
            {head(3, t('s3.title'))}
            <RecipeCard recipe={recipe} inputs={inputs} />
          </section>
          <section className="step" id="guide" aria-label={t('method.title')}>
            <Guide recipe={recipe} styleId={inputs.pizzaStyle} onCopy={copy} onPrint={print} />
          </section>
        </div>
      </main>

      <footer className="foot">
        <button type="button" className="btn btn-quiet" onClick={startOver}>{t('footer.startOver')}</button>
        <AddToHomeButton />
        <p>
          {t('app.footer')} · <a href="https://dogukanatlihan.com" target="_blank" rel="noopener noreferrer">Dogukan Atlihan</a>
        </p>
      </footer>

      {step === 3 ? (
        <BottomBar
          line1={t('bar.flour', { g: grams(weightOf(recipe, 'flour')) })}
          line2={`${t('bar.water', { g: grams(weightOf(recipe, 'water')) })} · ${balls}`}
          primary={t('action.copy')}
          onPrimary={copy}
          onBack={() => goTo(2)}
        />
      ) : (
        <BottomBar
          line1={`${styleName} · ${balls}`}
          line2={`${t('bar.dough', { g: grams(totalDough(recipe)) })} · ${sizeText(inputs, language)}`}
          primary={t(step === 1 ? 'bar.next' : 'bar.see')}
          onPrimary={() => goTo(step === 1 ? 2 : 3)}
          onBack={step === 2 ? () => goTo(1) : undefined}
        />
      )}
    </div>
  );
}
