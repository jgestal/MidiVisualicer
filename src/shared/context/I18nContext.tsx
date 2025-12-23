/**
 * Internationalization Context
 * 
 * Uses separate locale files for each language.
 * To add a new language, see instructions in src/locales/index.ts
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  TRANSLATIONS,
  LANGUAGES,
  type Language,
  type Translations
} from '../../locales';

// Re-export for backwards compatibility
export { LANGUAGES, type Language };
export type { Translations };

// Context type
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Get initial language from localStorage or default to English
function getInitialLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('midi-visualizer-language');
    if (saved && saved in TRANSLATIONS) {
      return saved as Language;
    }
  }
  // Default to English
  return 'en';
}

// Provider component
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('midi-visualizer-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use translations
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
