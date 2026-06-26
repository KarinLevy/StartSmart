import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from './en';
import he from './he';
import ru from './ru';
import ar from './ar';
import fr from './fr';
import de from './de';

const TRANSLATIONS = { en, he, ru, ar, fr, de };

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

  useEffect(() => { applyDirection(locale); }, [locale]);

  const setLocale = useCallback((code) => {
    if (!TRANSLATIONS[code]) return;
    try { localStorage.setItem(LOCALE_KEY, code); } catch {}
    setLocaleState(code);
  }, []);

  /**
   * t(key, vars?)
   * Looks up `key` in current locale, falls back to EN, then returns the key itself.
   * Supports {placeholder} interpolation via vars object.
   */
  const t = useCallback((key, vars = {}) => {
    const dict   = TRANSLATIONS[locale] ?? {};
    const fallback = TRANSLATIONS.en ?? {};
    let str = dict[key] ?? fallback[key] ?? key;
    if (vars && typeof str === 'string') {
      str = str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
    }
    return str;
  }, [locale]);

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
