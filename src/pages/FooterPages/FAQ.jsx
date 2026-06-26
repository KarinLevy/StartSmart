import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import { useLocale } from '../../i18n/LocaleContext';
import './FooterPage.css';

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {q}
        <span className={`material-symbols-outlined faq-chevron${open ? ' open' : ''}`} aria-hidden="true">expand_more</span>
      </button>
      {open && <div className="faq-answer">{a}</div>}
    </div>
  );
};

const FAQ = () => {
  const { t } = useLocale();

  const FAQS = [
    { q: t('faq.q1'),  a: t('faq.a1') },
    { q: t('faq.q2'),  a: t('faq.a2') },
    { q: t('faq.q3'),  a: t('faq.a3') },
    { q: t('faq.q4'),  a: t('faq.a4') },
    { q: t('faq.q5'),  a: t('faq.a5') },
    { q: t('faq.q6'),  a: t('faq.a6') },
    { q: t('faq.q7'),  a: t('faq.a7') },
    { q: t('faq.q8'),  a: t('faq.a8') },
    { q: t('faq.q9'),  a: t('faq.a9') },
    { q: t('faq.q10'), a: t('faq.a10') },
  ];

  return (
    <FooterPageShell>
      <div className="fp-hero">
        <div className="fp-badge">
          <span className="material-symbols-outlined">help</span>
          {t('faq.badge')}
        </div>
        <h1 className="fp-title">{t('faq.title')}</h1>
        <p className="fp-subtitle">
          {t('faq.subtitle')}{' '}
          <Link to="/help" style={{ color: 'var(--color-secondary)' }}>{t('faq.helpLink')}</Link>{' '}
          {t('common.or')}{' '}
          <Link to="/contact" style={{ color: 'var(--color-secondary)' }}>{t('faq.contactLink')}</Link>.
        </p>
      </div>

      <div className="fp-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
        </div>
      </div>
    </FooterPageShell>
  );
};

export default FAQ;
