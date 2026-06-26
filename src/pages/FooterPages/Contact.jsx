import React, { useState } from 'react';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import './FooterPage.css';

const TOPICS = ['General enquiry', 'Bug report', 'Feature request', 'Billing & plans', 'Privacy & data', 'Other'];

const CHANNELS = [
  { icon: 'email',    label: 'Email',         text: 'support@startsmart.app', href: 'mailto:support@startsmart.app' },
  { icon: 'forum',    label: 'Community',     text: 'Join our Discord',        href: '#' },
  { icon: 'schedule', label: 'Response time', text: 'Within 24 hours',         href: null },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <FooterPageShell>
      <div className="fp-hero">
        <div className="fp-badge">
          <span className="material-symbols-outlined">chat</span>
          Get in touch
        </div>
        <h1 className="fp-title">We&apos;d love to hear from you.</h1>
        <p className="fp-subtitle">
          Have a question, bug report, or feature idea? Send us a message and we&apos;ll get back to you within 24 hours.
        </p>
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
              <h3>Message sent!</h3>
              <p>Thanks for reaching out. We&apos;ll reply to {form.email || 'your email'} within 24 hours.</p>
              <button
                className="btn-secondary"
                style={{ marginTop: '0.5rem' }}
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', topic: '', message: '' }); }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="fp-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} noValidate>
              <div className="fp-form-row">
                <div className="fp-field">
                  <label htmlFor="contact-name">Name</label>
                  <input id="contact-name" type="text" placeholder="Maya Cohen" value={form.name} onChange={set('name')} required autoComplete="name" />
                </div>
                <div className="fp-field">
                  <label htmlFor="contact-email">Email</label>
                  <input id="contact-email" type="email" placeholder="maya@example.com" value={form.email} onChange={set('email')} required autoComplete="email" />
                </div>
              </div>
              <div className="fp-field">
                <label htmlFor="contact-topic">Topic</label>
                <select id="contact-topic" value={form.topic} onChange={set('topic')} required>
                  <option value="">Select a topic…</option>
                  {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="fp-field">
                <label htmlFor="contact-message">Message</label>
                <textarea id="contact-message" placeholder="Describe your question or issue in detail…" value={form.message} onChange={set('message')} required />
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                <span className="material-symbols-outlined" aria-hidden="true">send</span>
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </FooterPageShell>
  );
};

export default Contact;
