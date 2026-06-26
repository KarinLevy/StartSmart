import React from 'react';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import { useLocale } from '../../i18n/LocaleContext';
import './FooterPage.css';

const About = () => {
  const { t } = useLocale();

  const PILLARS = [
    { icon: 'lightbulb',         label: t('about.pillar1Label'), text: t('about.pillar1Text') },
    { icon: 'trending_up',       label: t('about.pillar2Label'), text: t('about.pillar2Text') },
    { icon: 'lock',              label: t('about.pillar3Label'), text: t('about.pillar3Text') },
    { icon: 'accessibility_new', label: t('about.pillar4Label'), text: t('about.pillar4Text') },
  ];

  const FOR_WHO = [
    { icon: 'school',           label: t('about.who1') },
    { icon: 'work',             label: t('about.who2') },
    { icon: 'groups',           label: t('about.who3') },
    { icon: 'laptop_mac',       label: t('about.who4') },
    { icon: 'family_restroom',  label: t('about.who5') },
    { icon: 'person',           label: t('about.who6') },
  ];

  return (
    <FooterPageShell>
      <div className="fp-hero">
        <div className="fp-badge">
          <span className="material-symbols-outlined">rocket_launch</span>
          {t('about.badge')}
        </div>
        <h1 className="fp-title">{t('about.title')}</h1>
        <p className="fp-subtitle">{t('about.subtitle')}</p>
      </div>

      <div className="fp-body">
        <div>
          <h2 className="fp-section-title">{t('about.storyTitle')}</h2>
          <p className="fp-text">{t('about.story1')}</p>
          <p className="fp-text">{t('about.story2')}</p>
          <p className="fp-text">{t('about.story3')}</p>
          <p className="fp-text">{t('about.story4')}</p>
        </div>

        <div>
          <h2 className="fp-section-title">{t('about.missionTitle')}</h2>
          <p className="fp-text">{t('about.mission1')}</p>
          <p className="fp-text">{t('about.mission2')}</p>
        </div>

        <div>
          <h2 className="fp-section-title">{t('about.visionTitle')}</h2>
          <p className="fp-text">{t('about.vision1')}</p>
          <p className="fp-text">{t('about.vision2')}</p>
        </div>

        <div>
          <h2 className="fp-section-title">{t('about.forWhoTitle')}</h2>
          <p className="fp-text" style={{ marginBottom: '1.25rem' }}>
            {t('about.forWhoIntro')}
          </p>
          <div className="fp-card-grid">
            {FOR_WHO.map((w) => (
              <div key={w.label} className="fp-icon-card">
                <div className="fp-icon-card-icon">
                  <span className="material-symbols-outlined">{w.icon}</span>
                </div>
                <div className="fp-icon-card-label" style={{ alignSelf: 'center' }}>{w.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="fp-section-title">{t('about.pillarTitle')}</h2>
          <div className="fp-card-grid">
            {PILLARS.map((p) => (
              <div key={p.label} className="fp-icon-card">
                <div className="fp-icon-card-icon">
                  <span className="material-symbols-outlined">{p.icon}</span>
                </div>
                <div>
                  <div className="fp-icon-card-label">{p.label}</div>
                  <div className="fp-icon-card-text">{p.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fp-card">
          <p className="fp-text">{t('about.closing1')}</p>
          <p className="fp-text" style={{ marginTop: '0.75rem' }}>
            {t('about.closing2')}{' '}
            <a href="mailto:hello@startsmart-app.com" style={{ color: 'var(--color-secondary)' }}>
              hello@startsmart-app.com
            </a>
          </p>
        </div>
      </div>
    </FooterPageShell>
  );
};

export default About;
