import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import { useLocale } from '../../i18n/LocaleContext';
import './FooterPage.css';

const HelpSection = ({ icon, title, items }) => {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.875rem' }}>
        <div className="fp-icon-card-icon" style={{ flexShrink: 0 }}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h2 className="fp-section-title" style={{ margin: 0 }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((item, i) => (
          <div key={i} className="faq-item">
            <button
              className="faq-question"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
            >
              {item.q}
              <span className={`material-symbols-outlined faq-chevron${openIndex === i ? ' open' : ''}`} aria-hidden="true">expand_more</span>
            </button>
            {openIndex === i && <div className="faq-answer">{item.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

const HelpCenter = () => {
  const { t } = useLocale();

  const SECTIONS = [
    {
      icon: 'play_circle',
      title: t('help.s1Title'),
      items: [
        { q: t('help.s1q1'), a: t('help.s1a1') },
        { q: t('help.s1q2'), a: t('help.s1a2') },
        { q: t('help.s1q3'), a: t('help.s1a3') },
      ],
    },
    {
      icon: 'task_alt',
      title: t('help.s2Title'),
      items: [
        { q: t('help.s2q1'), a: t('help.s2a1') },
        { q: t('help.s2q2'), a: t('help.s2a2') },
        { q: t('help.s2q3'), a: t('help.s2a3') },
        { q: t('help.s2q4'), a: t('help.s2a4') },
      ],
    },
    {
      icon: 'timer',
      title: t('help.s3Title'),
      items: [
        { q: t('help.s3q1'), a: t('help.s3a1') },
        { q: t('help.s3q2'), a: t('help.s3a2') },
        { q: t('help.s3q3'), a: t('help.s3a3') },
      ],
    },
    {
      icon: 'calendar_month',
      title: t('help.s4Title'),
      items: [
        { q: t('help.s4q1'), a: t('help.s4a1') },
        { q: t('help.s4q2'), a: t('help.s4a2') },
      ],
    },
    {
      icon: 'bar_chart',
      title: t('help.s5Title'),
      items: [
        { q: t('help.s5q1'), a: t('help.s5a1') },
        { q: t('help.s5q2'), a: t('help.s5a2') },
      ],
    },
    {
      icon: 'person',
      title: t('help.s6Title'),
      items: [
        { q: t('help.s6q1'), a: t('help.s6a1') },
        { q: t('help.s6q2'), a: t('help.s6a2') },
      ],
    },
    {
      icon: 'lock_reset',
      title: t('help.s7Title'),
      items: [
        { q: t('help.s7q1'), a: t('help.s7a1') },
        { q: t('help.s7q2'), a: t('help.s7a2') },
      ],
    },
    {
      icon: 'support_agent',
      title: t('help.s8Title'),
      items: [
        { q: t('help.s8q1'), a: t('help.s8a1') },
        { q: t('help.s8q2'), a: t('help.s8a2') },
      ],
    },
  ];

  return (
    <FooterPageShell>
      <div className="fp-hero">
        <div className="fp-badge">
          <span className="material-symbols-outlined">menu_book</span>
          {t('help.badge')}
        </div>
        <h1 className="fp-title">{t('help.title')}</h1>
        <p className="fp-subtitle">
          {t('help.subtitle')}{' '}
          <Link to="/contact" style={{ color: 'var(--color-secondary)' }}>{t('help.contactLink')}</Link>{' '}
          {t('common.or')} we will help you out.
        </p>
      </div>

      <div className="fp-body">
        {SECTIONS.map((s) => (
          <HelpSection key={s.title} {...s} />
        ))}
      </div>
    </FooterPageShell>
  );
};

export default HelpCenter;
