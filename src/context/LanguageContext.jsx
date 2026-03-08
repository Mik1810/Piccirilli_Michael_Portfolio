import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import staticI18n from '../data/staticI18n.json';
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'it';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const translations = staticI18n[lang] || staticI18n.it || {};
  const loading = false;

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'it' ? 'en' : 'it'));
  }, []);

  const t = useCallback(
    (key) => {
      const keys = key.split('.');
      let val = translations;
      for (const k of keys) {
        val = val?.[k];
      }
      return val ?? key;
    },
    [translations]
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
