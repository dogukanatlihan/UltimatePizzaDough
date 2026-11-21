import './design.css';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
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
import { Photo } from './Photo';
import { runTransition } from './motion';
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
  // The card that was just tapped: its photo carries into the next step. Null means "the selected style".
  const [tapped, setTapped] = useState<string | null>(null);
  // Computed here, not read from the hook's state, so the numbers never lag a render behind the control.
  const recipe = useMemo(() => calculateDoughRecipe(inputs), [inputs]);

  const goTo = (next: Step) => {
    moved.current = true;
    trackTabChange(STEP_KEYS[next].replace('step.', ''));
    // Side by side there is nothing to transition between.
    if (wide || next === step) setStep(next);
    else runTransition(() => flushSync(() => setStep(next)), next > step ? 'forward' : 'back');
  };

  // After a step change: top of the page on phones, and focus on the new step's heading for keyboards and screen readers.
  // Only a step change triggers this, never a resize across the breakpoint.
  const wideNow = useRef(wide);
  wideNow.current = wide;
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    const heading = headings.current[step];
    if (wideNow.current) heading?.scrollIntoView({ block: 'nearest' });
    else window.scrollTo({ top: 0 });
    heading?.focus({ preventScroll: true });
  }, [step]);

  const pickStyle = (styleId: string) => {
    if (wide) {
      calc.handlePizzaStyleChange(styleId);
      return;
    }
    // Name the tapped photo before the browser takes its "before" picture, then change style and step together.
    flushSync(() => setTapped(styleId));
    moved.current = true;
    trackTabChange('size');
    runTransition(() => flushSync(() => {
      calc.handlePizzaStyleChange(styleId);
      setStep(2);
      setTapped(null);
    }), 'forward');
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
    if (calc.pristine) return; // nothing to start over; also keeps a second press from replacing the Undo
    const previous = calc.startOver();
    // No heading focus here: focus goes to Undo inside the toast.
    if (wide || step === 1) setStep(1);
    else runTransition(() => flushSync(() => setStep(1)), 'back');
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
      <Header step={wide ? null : step} onStep={goTo} />

      <main className="steps" data-step={step}>
        <section className="step" id="s1" aria-labelledby="h-1">
          {head(1, t('s1.title'))}
          <StepStyle value={inputs.pizzaStyle} onPick={pickStyle} morphId={tapped ?? inputs.pizzaStyle} />
        </section>

        <section className="step" id="s2" aria-labelledby="h-2">
          <button type="button" className="chip" onClick={() => goTo(1)}>
            <Photo styleId={inputs.pizzaStyle} className="chip-photo" eager />
            <span className="chip-name">{styleName}</span>
            <span className="chip-change">{t('chip.change')}</span>
          </button>
          {head(2, t('s2.title'))}
          <StepSize calc={calc} />
        </section>

        {/* Reading order and Tab order are the same: recipe, then its controls, then how to make it. */}
        <section className="step" id="card" aria-labelledby="h-3">
          {head(3, t('s3.title'))}
          <RecipeCard recipe={recipe} inputs={inputs} />
        </section>

        <section className="step" id="tune" aria-label={t('tune.title')}>
          <Tuning calc={calc} recipe={recipe} />
        </section>

        <section className="step" id="guide" aria-label={t('method.title')}>
          <Guide recipe={recipe} styleId={inputs.pizzaStyle} onCopy={copy} onPrint={print} />
        </section>
      </main>

      <footer className="foot">
        {!calc.pristine && <button type="button" className="btn btn-quiet" onClick={startOver}>{t('footer.startOver')}</button>}
        <AddToHomeButton />
        <p>
          {t('app.footer')} · <a href="https://dogukanatlihan.com" target="_blank" rel="noopener noreferrer">Dogukan Atlihan</a>
        </p>
      </footer>

      {step === 3 ? (
        <BottomBar
          line1={t('bar.flour', { g: grams(weightOf(recipe, 'flour')) })}
          line2={t('bar.water', { g: grams(weightOf(recipe, 'water')) })}
          primary={t('action.copy')}
          onPrimary={copy}
          onBack={() => goTo(2)}
        />
      ) : (
        <BottomBar
          line1={step === 1 ? styleName : balls}
          line2={step === 1 ? `${balls} · ${sizeText(inputs, language)}` : t('bar.dough', { g: grams(totalDough(recipe)) })}
          primary={t(step === 1 ? 'bar.next' : 'bar.see')}
          onPrimary={() => goTo(step === 1 ? 2 : 3)}
          onBack={step === 2 ? () => goTo(1) : undefined}
        />
      )}
    </div>
  );
}
