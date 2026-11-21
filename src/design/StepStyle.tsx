import { PIZZA_STYLES } from '../utils/doughCalculator';
import { useTranslation } from '../context/TranslationContext';
import { STYLE_IMAGES, STYLE_IMAGE_SIZE, STYLE_TINT } from './styleMeta';

interface Props {
  value: string;
  onPick: (styleId: string) => void;
}

export function StepStyle({ value, onPick }: Props) {
  const { t } = useTranslation();
  return (
    <div className="pick">
      {PIZZA_STYLES.map((s, i) => (
        <button type="button" key={s.id} className="style-card" aria-pressed={s.id === value} onClick={() => onPick(s.id)}>
          <span className="style-photo" style={{ background: STYLE_TINT[s.id] }}>
            {/* The name is in the text beside it, so the photo is decoration for screen readers. */}
            <img src={STYLE_IMAGES[s.id]} alt="" width={STYLE_IMAGE_SIZE} height={STYLE_IMAGE_SIZE} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
          </span>
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
