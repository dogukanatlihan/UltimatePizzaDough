import { useTranslation } from '../context/TranslationContext';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';

export type Step = 1 | 2 | 3;
export const STEP_KEYS: Record<Step, string> = { 1: 'step.style', 2: 'step.size', 3: 'step.recipe' };

/** `step` is null when all three steps are on screen (wide layout): then no tab is the current one. */
export function Header({ step, onStep }: Readonly<{ step: Step | null; onStep: (step: Step) => void }>) {
  const { t } = useTranslation();
  return (
    <header className="top">
      <div className="flag" aria-hidden="true" />
      <div className="top-in">
        <div className="brand">Make Better Pizza</div>
        <div className="top-tools">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <nav className="tabs" aria-label={t('nav.steps')}>
          {([1, 2, 3] as const).map((n) => (
            <button type="button" key={n} className="tab" aria-current={n === step ? 'step' : undefined} onClick={() => onStep(n)}>
              <span className="tab-n num" aria-hidden="true">{n}</span>
              <span>{t(STEP_KEYS[n])}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
