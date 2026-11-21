import { useTranslation } from '../context/TranslationContext';

/** Shows the language you can switch to. */
export default function LanguageToggle() {
  const { language, setLanguage, t } = useTranslation();
  const english = language === 'en';
  return (
    <button type="button" className="tool tool-text" onClick={() => setLanguage(english ? 'tr' : 'en')} aria-label={t(english ? 'lang.toTurkish' : 'lang.toEnglish')}>
      {english ? 'TR' : 'EN'}
    </button>
  );
}
