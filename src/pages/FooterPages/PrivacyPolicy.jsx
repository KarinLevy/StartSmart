import React from 'react';
import { Link } from 'react-router-dom';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import { useLocale } from '../../i18n/LocaleContext';
import './FooterPage.css';

const PrivacyPolicy = () => {
  const { t } = useLocale();

  const SECTIONS = [
    {
      title: t('privacy.s1Title'),
      body: [t('privacy.s1b1'), t('privacy.s1b2')],
    },
    {
      title: t('privacy.s2Title'),
      body: [t('privacy.s2b1'), t('privacy.s2b2')],
    },
    {
      title: t('privacy.s3Title'),
      body: [t('privacy.s3b1'), t('privacy.s3b2')],
    },
    {
      title: t('privacy.s4Title'),
      body: [t('privacy.s4b1'), t('privacy.s4b2')],
    },
    {
      title: t('privacy.s5Title'),
      body: [t('privacy.s5b1')],
      items: [t('privacy.s5i1'), t('privacy.s5i2'), t('privacy.s5i3'), t('privacy.s5i4')],
    },
    {
      title: t('privacy.s6Title'),
      body: [t('privacy.s6b1')],
    },
    {
      title: t('privacy.s7Title'),
      body: [t('privacy.s7b1')],
      items: [t('privacy.s7i1'), t('privacy.s7i2'), t('privacy.s7i3'), t('privacy.s7i4')],
    },
    {
      title: t('privacy.s8Title'),
      body: [t('privacy.s8b1')],
    },
    {
      title: t('privacy.s9Title'),
      body: [t('privacy.s9b1'), t('privacy.s9b2')],
    },
    {
      title: t('privacy.s10Title'),
      body: [t('privacy.s10b1'), t('privacy.s10b2')],
    },
  ];

  return (
    <FooterPageShell>
      <div className="fp-hero">
        <div className="fp-badge">
          <span className="material-symbols-outlined">lock</span>
          {t('privacy.badge')}
        </div>
        <h1 className="fp-title">{t('privacy.title')}</h1>
        <p className="fp-subtitle">{t('privacy.subtitle')}</p>
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
            {t('privacy.footer')}{' '}
            <a href="mailto:support@startsmart-app.com" style={{ color: 'var(--color-secondary)' }}>support@startsmart-app.com</a>{' '}
            or visit our <Link to="/contact" style={{ color: 'var(--color-secondary)' }}>{t('privacy.contactLink')}</Link>.
          </p>
        </div>
      </div>
    </FooterPageShell>
  );
};

export default PrivacyPolicy;
