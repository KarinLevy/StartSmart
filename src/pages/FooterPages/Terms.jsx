import React from 'react';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import { useLocale } from '../../i18n/LocaleContext';
import './FooterPage.css';

const Terms = () => {
  const { t } = useLocale();

  const SECTIONS = [
    {
      title: t('terms.s1Title'),
      body: [t('terms.s1b1')],
    },
    {
      title: t('terms.s2Title'),
      body: [t('terms.s2b1')],
      items: [t('terms.s2i1'), t('terms.s2i2'), t('terms.s2i3'), t('terms.s2i4')],
    },
    {
      title: t('terms.s3Title'),
      body: [t('terms.s3b1')],
      items: [t('terms.s3i1'), t('terms.s3i2'), t('terms.s3i3'), t('terms.s3i4')],
    },
    {
      title: t('terms.s4Title'),
      body: [t('terms.s4b1'), t('terms.s4b2')],
    },
    {
      title: t('terms.s5Title'),
      body: [t('terms.s5b1'), t('terms.s5b2')],
    },
    {
      title: t('terms.s6Title'),
      body: [t('terms.s6b1')],
    },
    {
      title: t('terms.s7Title'),
      body: [t('terms.s7b1')],
    },
    {
      title: t('terms.s8Title'),
      body: [t('terms.s8b1'), t('terms.s8b2'), t('terms.s8b3')],
    },
  ];

  return (
    <FooterPageShell>
      <div className="fp-hero">
        <div className="fp-badge">
          <span className="material-symbols-outlined">gavel</span>
          {t('terms.badge')}
        </div>
        <h1 className="fp-title">{t('terms.title')}</h1>
        <p className="fp-subtitle">{t('terms.subtitle')}</p>
      </div>

      <div className="fp-body">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="fp-section-title">{s.title}</h2>
            {s.body.map((text, i) => <p key={i} className="fp-text">{text}</p>)}
            {s.items && (
              <ul className="fp-list" style={{ marginTop: '0.75rem' }}>
                {s.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </div>
        ))}

        <div className="fp-card">
          <p className="fp-text">
            {t('terms.footer')}{' '}
            <a href="mailto:hello@startsmart-app.com" style={{ color: 'var(--color-secondary)' }}>hello@startsmart-app.com</a>
          </p>
        </div>
      </div>
    </FooterPageShell>
  );
};

export default Terms;
