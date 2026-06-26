import React from 'react';
import { Link } from 'react-router-dom';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import { useLocale } from '../../i18n/LocaleContext';
import './FooterPage.css';

const Accessibility = () => {
  const { t } = useLocale();

  const FEATURES = [
    { icon: 'devices',     label: t('accessibility.f1Label'), text: t('accessibility.f1Text') },
    { icon: 'keyboard',    label: t('accessibility.f2Label'), text: t('accessibility.f2Text') },
    { icon: 'contrast',    label: t('accessibility.f3Label'), text: t('accessibility.f3Text') },
    { icon: 'text_fields', label: t('accessibility.f4Label'), text: t('accessibility.f4Text') },
    { icon: 'label',       label: t('accessibility.f5Label'), text: t('accessibility.f5Text') },
    { icon: 'dark_mode',   label: t('accessibility.f6Label'), text: t('accessibility.f6Text') },
  ];

  return (
    <FooterPageShell>
      <div className="fp-hero">
        <div className="fp-badge">
          <span className="material-symbols-outlined">accessibility_new</span>
          {t('accessibility.badge')}
        </div>
        <h1 className="fp-title">{t('accessibility.title')}</h1>
        <p className="fp-subtitle">{t('accessibility.subtitle')}</p>
      </div>

      <div className="fp-body">
        <div>
          <h2 className="fp-section-title">{t('accessibility.approachTitle')}</h2>
          <p className="fp-text">{t('accessibility.approach1')}</p>
          <p className="fp-text">{t('accessibility.approach2')}</p>
        </div>

        <div>
          <h2 className="fp-section-title">{t('accessibility.inPlaceTitle')}</h2>
          <div className="fp-card-grid">
            {FEATURES.map((f) => (
              <div key={f.label} className="fp-icon-card">
                <div className="fp-icon-card-icon">
                  <span className="material-symbols-outlined">{f.icon}</span>
                </div>
                <div>
                  <div className="fp-icon-card-label">{f.label}</div>
                  <div className="fp-icon-card-text">{f.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="fp-section-title">{t('accessibility.ongoingTitle')}</h2>
          <p className="fp-text">{t('accessibility.ongoing1')}</p>
          <p className="fp-text">{t('accessibility.ongoing2')}</p>
        </div>

        <div className="fp-card">
          <p className="fp-text">
            {t('accessibility.footer')}{' '}
            <a href="mailto:hello@startsmart-app.com" style={{ color: 'var(--color-secondary)' }}>hello@startsmart-app.com</a>{' '}
            or through our{' '}
            <Link to="/contact" style={{ color: 'var(--color-secondary)' }}>{t('accessibility.contactLink')}</Link>.
            {' '}{t('accessibility.footerThanks')}
          </p>
        </div>
      </div>
    </FooterPageShell>
  );
};

export default Accessibility;
