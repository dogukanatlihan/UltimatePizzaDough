import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

import { translate, type Language, type Translate } from './translations';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translate;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Storage throws in some private windows; fall back to English.
    try {
      const saved = localStorage.getItem('language');
      if (saved === 'en' || saved === 'tr') return saved;
    } catch { /* no saved choice */ }
    return 'en';
  });

  useEffect(() => {
    try { localStorage.setItem('language', language); } catch { /* not remembered */ }
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  // One object per language, so consumers re-render only when the language changes.
  const value = useMemo(() => {
    const t: Translate = (key, vars) => translate(language, key, vars);
    return { language, setLanguage, t };
  }, [language]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
