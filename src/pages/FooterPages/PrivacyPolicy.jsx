import React from 'react';
import { Link } from 'react-router-dom';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import './FooterPage.css';

const SECTIONS = [
  { title: 'Information We Collect', body: ['We collect information you provide directly to us when you create an account, such as your name, email address, and profile photo.', 'We also collect data about how you use StartSmart — including task titles, estimated vs. actual durations, focus session timestamps, and productivity patterns — to power the Gap analysis features that make StartSmart useful.'] },
  { title: 'How We Use Your Information', body: ['Your task and focus data is used solely to generate your personal productivity insights. We never sell your personal data to third parties.', 'We may use aggregated, anonymised data (not linked to any individual) to improve product features.'], items: ['Calculate and display your Gap metrics and trends', 'Send in-app notifications about your tasks and sessions', 'Provide customer support and respond to inquiries', 'Improve the accuracy of our time-estimation suggestions'] },
  { title: 'Data Storage & Security', body: ['All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. We follow industry-standard security practices and conduct regular security reviews.', 'StartSmart is currently in beta. Task data you create during this phase is stored locally in your browser (localStorage). No data is transmitted to external servers in this version.'] },
  { title: 'Cookies', body: ['We use only essential cookies required to maintain your session and remember your theme preference. We do not use advertising or tracking cookies.'] },
  { title: 'Your Rights', body: ['You have the right to access, correct, export, or delete your personal data at any time from the Settings page. If you wish to close your account entirely, contact us at privacy@startsmart.app.'], items: ['Access — see what data we hold about you', 'Correction — fix inaccurate information', 'Erasure — request deletion of your account and data', 'Portability — export your task history as JSON or CSV'] },
  { title: 'Changes to This Policy', body: ['We may update this Privacy Policy from time to time. When we make significant changes, we will notify you via an in-app notification and update the "Last updated" date below.', 'Last updated: June 2026'] },
];

const PrivacyPolicy = () => (
  <FooterPageShell>
    <div className="fp-hero">
      <div className="fp-badge">
        <span className="material-symbols-outlined">lock</span>
        Legal
      </div>
      <h1 className="fp-title">Privacy Policy</h1>
      <p className="fp-subtitle">
        Your privacy matters to us. This policy explains what data StartSmart collects, how we use it, and the controls you have over it.
      </p>
    </div>

    <div className="fp-body">
      {SECTIONS.map((s) => (
        <div key={s.title}>
          <h2 className="fp-section-title">{s.title}</h2>
          {s.body.map((t, i) => <p key={i} className="fp-text">{t}</p>)}
          {s.items && (
            <ul className="fp-list" style={{ marginTop: '0.75rem' }}>
              {s.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </div>
      ))}

      <div className="fp-card">
        <p className="fp-text">
          Questions about this policy? Contact our privacy team at{' '}
          <a href="mailto:privacy@startsmart.app" style={{ color: 'var(--color-secondary)' }}>privacy@startsmart.app</a>{' '}
          or visit our <Link to="/contact" style={{ color: 'var(--color-secondary)' }}>Contact page</Link>.
        </p>
      </div>
    </div>
  </FooterPageShell>
);

export default PrivacyPolicy;
