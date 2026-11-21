import { PIZZA_STYLES } from '../utils/doughCalculator';
import { useTranslation } from '../context/TranslationContext';
import { Photo } from './Photo';

interface Props {
  value: string;
  onPick: (styleId: string) => void;
  /** The card whose photo travels to the next step. */
  morphId: string;
}

export function StepStyle({ value, onPick, morphId }: Props) {
  const { t } = useTranslation();
  return (
    <div className="pick">
      {PIZZA_STYLES.map((s, i) => (
        <button type="button" key={s.id} className="style-card" aria-pressed={s.id === value} onClick={() => onPick(s.id)}>
          <Photo styleId={s.id} className="style-photo" eager={i < 2} transitionName={s.id === morphId ? 'style-photo' : undefined} />
          <span className="style-text">
            <span className="style-name">{t(`style.${s.id}`)}</span>
            <span className="style-short">{t(`style.${s.id}.short`)}</span>
          </span>
          <span className="style-check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </span>
        </button>
      ))}
    </div>
  );
}
