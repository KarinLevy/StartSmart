import React from 'react';
import { Link } from 'react-router-dom';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import { useLocale } from '../../i18n/LocaleContext';
import './FooterPage.css';

const Cookies = () => {
  const { t } = useLocale();

  const COOKIE_TYPES = [
    {
      icon: 'key',
      label: t('cookies.c1Label'),
      required: true,
      text: t('cookies.c1Text'),
    },
    {
      icon: 'tune',
      label: t('cookies.c2Label'),
      required: true,
      text: t('cookies.c2Text'),
    },
    {
      icon: 'bar_chart',
      label: t('cookies.c3Label'),
      required: false,
      text: t('cookies.c3Text'),
    },
    {
      icon: 'block',
      label: t('cookies.c4Label'),
      required: false,
      text: t('cookies.c4Text'),
    },
  ];

  return (
    <FooterPageShell>
      <div className="fp-hero">
        <div className="fp-badge">
          <span className="material-symbols-outlined">cookie</span>
          {t('cookies.badge')}
        </div>
        <h1 className="fp-title">{t('cookies.title')}</h1>
        <p className="fp-subtitle">{t('cookies.subtitle')}</p>
      </div>

      <div className="fp-body">
        <div>
          <h2 className="fp-section-title">{t('cookies.whatTitle')}</h2>
          <p className="fp-text">{t('cookies.whatText')}</p>
        </div>

        <div>
          <h2 className="fp-section-title">{t('cookies.usedTitle')}</h2>
          <div className="fp-card-grid">
            {COOKIE_TYPES.map((c) => (
              <div key={c.label} className="fp-icon-card" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="fp-icon-card-icon">
                    <span className="material-symbols-outlined">{c.icon}</span>
                  </div>
                  <div>
                    <div className="fp-icon-card-label">{c.label}</div>
                    <div style={{ fontSize: 'var(--font-size-label-sm)', color: c.required ? 'var(--color-secondary)' : 'var(--color-on-surface-variant)', marginTop: '0.1rem' }}>
                      {c.required ? t('cookies.c1Essential') : t('cookies.c1NotUsed')}
                    </div>
                  </div>
                </div>
                <div className="fp-icon-card-text">{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="fp-section-title">{t('cookies.managingTitle')}</h2>
          <p className="fp-text">{t('cookies.managing1')}</p>
          <p className="fp-text">{t('cookies.managing2')}</p>
        </div>

        <div className="fp-card">
          <p className="fp-text">
            {t('cookies.footer')}{' '}
            <Link to="/privacy-policy" style={{ color: 'var(--color-secondary)' }}>{t('cookies.privacyLink')}</Link>{' '}
            {t('cookies.orText')}{' '}
            <Link to="/contact" style={{ color: 'var(--color-secondary)' }}>{t('cookies.contactLink')}</Link>.
          </p>
          <p className="fp-text" style={{ marginTop: '0.5rem' }}>{t('cookies.updated')}</p>
        </div>
      </div>
    </FooterPageShell>
  );
};

export default Cookies;
