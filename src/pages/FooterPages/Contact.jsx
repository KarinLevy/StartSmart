import React, { useState } from 'react';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import { useLocale } from '../../i18n/LocaleContext';
import './FooterPage.css';

const Contact = () => {
  const { t } = useLocale();
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const TOPICS = [
    t('contact.topic1'),
    t('contact.topic2'),
    t('contact.topic3'),
    t('contact.topic4'),
    t('contact.topic5'),
    t('contact.topic6'),
  ];

  const CHANNELS = [
    { icon: 'support_agent', label: t('contact.ch1Label'), text: t('contact.ch1Text'), href: 'mailto:support@startsmart-app.com' },
    { icon: 'mail',          label: t('contact.ch2Label'), text: t('contact.ch2Text'), href: 'mailto:hello@startsmart-app.com' },
    { icon: 'schedule',      label: t('contact.ch3Label'), text: t('contact.ch3Text'), href: null },
  ];

  return (
    <FooterPageShell>
      <div className="fp-hero">
        <div className="fp-badge">
          <span className="material-symbols-outlined">chat</span>
          {t('contact.badge')}
        </div>
        <h1 className="fp-title">{t('contact.title')}</h1>
        <p className="fp-subtitle">{t('contact.subtitle')}</p>
      </div>

      <div className="fp-body">
        <div className="fp-card-grid">
          {CHANNELS.map((c) => (
            <div key={c.label} className="fp-icon-card">
              <div className="fp-icon-card-icon">
                <span className="material-symbols-outlined">{c.icon}</span>
              </div>
              <div>
                <div className="fp-icon-card-label">{c.label}</div>
                {c.href ? (
                  <a className="fp-icon-card-text" href={c.href} style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}>{c.text}</a>
                ) : (
                  <div className="fp-icon-card-text">{c.text}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="fp-card">
          {submitted ? (
            <div className="fp-submit-success">
              <div className="fp-submit-success-icon">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <h3>{t('contact.successTitle')}</h3>
              <p>{t('contact.successMsg', { email: form.email || t('contact.emailPh') })}</p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: '0.5rem' }}
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', topic: '', message: '' }); }}
              >
                {t('contact.sendAnother')}
              </button>
            </div>
          ) : (
            <form className="fp-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} noValidate>
              <div className="fp-form-row">
                <div className="fp-field">
                  <label htmlFor="contact-name">{t('contact.nameLbl')}</label>
                  <input id="contact-name" type="text" placeholder={t('contact.namePh')} value={form.name} onChange={set('name')} required autoComplete="name" />
                </div>
                <div className="fp-field">
                  <label htmlFor="contact-email">{t('contact.emailLbl')}</label>
                  <input id="contact-email" type="email" placeholder={t('contact.emailPh')} value={form.email} onChange={set('email')} required autoComplete="email" />
                </div>
              </div>
              <div className="fp-field">
                <label htmlFor="contact-topic">{t('contact.topicLbl')}</label>
                <select id="contact-topic" value={form.topic} onChange={set('topic')} required>
                  <option value="">{t('contact.topicPh')}</option>
                  {TOPICS.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
                </select>
              </div>
              <div className="fp-field">
                <label htmlFor="contact-message">{t('contact.messageLbl')}</label>
                <textarea id="contact-message" placeholder={t('contact.messagePh')} value={form.message} onChange={set('message')} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                <span className="material-symbols-outlined" aria-hidden="true">send</span>
                {t('contact.send')}
              </button>
            </form>
          )}
        </div>
      </div>
    </FooterPageShell>
  );
};

export default Contact;
