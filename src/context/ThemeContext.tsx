import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { trackThemeChange } from '../utils/analytics';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if user has a saved preference or use system preference
  const getInitialTheme = (): ThemeType => {
    // Storage throws in some private windows; fall back to the system setting.
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    } catch { /* no saved choice */ }
    
    // Check system preference
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<ThemeType>(getInitialTheme);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch { /* not remembered */ }
    
    // Update color-scheme meta tag to inform browser plugins like Dark Reader
    let colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (!colorSchemeMeta) {
      colorSchemeMeta = document.createElement('meta');
      colorSchemeMeta.setAttribute('name', 'color-scheme');
      document.head.appendChild(colorSchemeMeta);
    }
    colorSchemeMeta.setAttribute('content', theme);
    
    // Also update the root element's style for maximum compatibility
    document.documentElement.style.colorScheme = theme;
    
    // Track theme change, but only after initial render
    if (document.documentElement.dataset.analyticsTracked === 'true') {
      trackThemeChange(theme);
    } else {
      document.documentElement.dataset.analyticsTracked = 'true';
    }
  }, [theme]);

  // One object per theme, so consumers re-render only when the theme changes.
  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 