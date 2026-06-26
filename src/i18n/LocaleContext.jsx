import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from './translations/en';
import he from './translations/he';
import ru from './translations/ru';
import ar from './translations/ar';
import fr from './translations/fr';
import de from './translations/de';

const TRANSLATIONS = { en, he, ru, ar, fr, de };

// Languages that use right-to-left text direction
const RTL_LOCALES = new Set(['he', 'ar']);

export const LANGUAGES = [
  { code: 'en', flag: '🇺🇸', nativeName: 'English' },
  { code: 'he', flag: '🇮🇱', nativeName: 'עברית' },
  { code: 'ru', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'ar', flag: '🇸🇦', nativeName: 'العربية' },
  { code: 'fr', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', flag: '🇩🇪', nativeName: 'Deutsch' },
];

const LOCALE_KEY = 'ss_locale';

const LocaleContext = createContext(null);

function loadLocale() {
  try { return localStorage.getItem(LOCALE_KEY) ?? 'en'; }
  catch { return 'en'; }
}

function applyDirection(locale) {
  const dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
  document.documentElement.dir  = dir;
  document.documentElement.lang = locale;
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(loadLocale);

  // Apply direction on first render and on change
  useEffect(() => { applyDirection(locale); }, [locale]);

  const setLocale = useCallback((code) => {
    if (!TRANSLATIONS[code]) return;
    try { localStorage.setItem(LOCALE_KEY, code); } catch {}
    setLocaleState(code);
  }, []);

  const t = TRANSLATIONS[locale] ?? en;
  const isRTL = RTL_LOCALES.has(locale);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, isRTL, LANGUAGES }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>');
  return ctx;
}
