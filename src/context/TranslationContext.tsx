import React, { createContext, useState, useContext, useEffect } from 'react';

import { translations, type Language } from './translations';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
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

  // {name} placeholders are filled from `vars`.
  const t = (key: string, vars?: Record<string, string | number>): string => {
    const text = translations[key]?.[language] || key;
    return vars ? text.replace(/\{(\w+)\}/g, (whole, name) => (name in vars ? String(vars[name]) : whole)) : text;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
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
