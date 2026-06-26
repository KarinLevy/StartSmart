import React, { useState, useRef, useEffect } from 'react';
import { useLocale, LANGUAGES } from '../../i18n/LocaleContext';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="ls-wrap" ref={ref}>
      <button
        className="ls-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('lang.choose')}
        title={t('lang.choose')}
      >
        <span className="ls-flag">{current.flag}</span>
        <span className="ls-code">{current.code.toUpperCase()}</span>
        <span className="material-symbols-outlined ls-chevron" aria-hidden="true">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && (
        <ul className="ls-dropdown" role="listbox" aria-label={t('lang.choose')}>
          {LANGUAGES.map((lang) => (
            <li
              key={lang.code}
              className={`ls-option${lang.code === locale ? ' active' : ''}`}
              role="option"
              aria-selected={lang.code === locale}
              onClick={() => { setLocale(lang.code); setOpen(false); }}
            >
              <span className="ls-flag">{lang.flag}</span>
              <span className="ls-native">{lang.nativeName}</span>
              {lang.code === locale && (
                <span className="material-symbols-outlined ls-check" aria-hidden="true">check</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
