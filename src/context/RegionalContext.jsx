import React, { createContext, useContext, useMemo } from 'react';
import { useLocale } from '../i18n/LocaleContext';

/**
 * Regional settings are derived automatically from the selected language.
 * No manual configuration — when the user changes language, these update instantly.
 */
const LOCALE_REGIONAL = {
  he: { timezone: 'Asia/Jerusalem',   dateFormat: 'DD/MM/YYYY', timeFormat: '24h', firstDayOfWeek: 'sunday' },
  ar: { timezone: 'Asia/Riyadh',      dateFormat: 'DD/MM/YYYY', timeFormat: '24h', firstDayOfWeek: 'sunday' },
  en: { timezone: 'America/New_York', dateFormat: 'MM/DD/YYYY', timeFormat: '12h', firstDayOfWeek: 'sunday' },
  fr: { timezone: 'Europe/Paris',     dateFormat: 'DD/MM/YYYY', timeFormat: '24h', firstDayOfWeek: 'monday' },
  de: { timezone: 'Europe/Berlin',    dateFormat: 'DD.MM.YYYY', timeFormat: '24h', firstDayOfWeek: 'monday' },
  ru: { timezone: 'Europe/Moscow',    dateFormat: 'DD.MM.YYYY', timeFormat: '24h', firstDayOfWeek: 'monday' },
};

const FALLBACK = { timezone: 'UTC', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', firstDayOfWeek: 'sunday' };

const RegionalContext = createContext(null);

export function RegionalProvider({ children }) {
  const { locale } = useLocale();
  const regional = useMemo(() => LOCALE_REGIONAL[locale] ?? FALLBACK, [locale]);

  return (
    <RegionalContext.Provider value={{ regional }}>
      {children}
    </RegionalContext.Provider>
  );
}

export function useRegional() {
  const ctx = useContext(RegionalContext);
  if (!ctx) throw new Error('useRegional must be inside <RegionalProvider>');
  return ctx;
}
