import { useTranslation } from '../context/TranslationContext';

interface Props {
  line1: string;
  line2: string;
  primary: string;
  onPrimary: () => void;
  /** Absent on the first step. */
  onBack?: () => void;
}

/** Phones only: the result and the next step, always in reach. */
export function BottomBar({ line1, line2, primary, onPrimary, onBack }: Props) {
  const { t } = useTranslation();
  return (
    <div className="bar">
      {onBack && (
        <button type="button" className="bar-back" onClick={onBack} aria-label={t('bar.back')}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
      )}
      <div className="bar-sum" aria-live="polite">
        <b className="num">{line1}</b>
        <span className="num">{line2}</span>
      </div>
      <button type="button" className="btn btn-primary bar-go" onClick={onPrimary}>{primary}</button>
    </div>
  );
}
