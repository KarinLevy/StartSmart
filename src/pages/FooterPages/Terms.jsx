import React from 'react';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import './FooterPage.css';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'By creating an account or using StartSmart ("the Service"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the Service.',
    ],
  },
  {
    title: '2. Accounts and Responsibilities',
    body: [
      'You are responsible for maintaining the security of your account credentials. Do not share your password with anyone.',
    ],
    items: [
      'You must be at least 13 years old to create an account',
      'You are responsible for all activity that occurs under your account',
      'Notify us immediately if you suspect unauthorised access to your account',
      'You may only create one account per person',
    ],
  },
  {
    title: '3. Acceptable Use',
    body: [
      'You may use StartSmart for any lawful personal or professional purpose. The following are not permitted:',
    ],
    items: [
      'Attempting to reverse-engineer, scrape, or disrupt the Service',
      'Submitting content that is unlawful, harmful, or offensive',
      'Using the Service to infringe the rights of any third party',
      'Creating automated accounts or bots without written permission',
    ],
  },
  {
    title: '4. Intellectual Property',
    body: [
      'All design, code, branding, and content within StartSmart is the intellectual property of the creator and is protected by applicable copyright law. You may not copy, reproduce, or redistribute any part of the Service without explicit written permission.',
      'Your own data — tasks, notes, and focus logs — remains yours. By submitting content to the Service, you grant a limited licence to process it solely for the purpose of delivering the Service to you.',
    ],
  },
  {
    title: '5. Service Availability',
    body: [
      'We aim to keep StartSmart available and reliable, but we do not guarantee uninterrupted access. The Service may occasionally be unavailable for maintenance, updates, or reasons outside our control.',
      'StartSmart is provided as-is. We make no warranties regarding fitness for a particular purpose or specific uptime guarantees.',
    ],
  },
  {
    title: '6. Limitation of Liability',
    body: [
      'To the extent permitted by applicable law, StartSmart shall not be liable for any indirect, incidental, or consequential damages arising from your use of or inability to use the Service. This includes loss of data, loss of productivity, or any other loss that results from your reliance on the Service.',
    ],
  },
  {
    title: '7. Termination',
    body: [
      'You may close your account at any time by contacting us at support@startsmart-app.com. We reserve the right to suspend or terminate accounts that violate these Terms.',
    ],
  },
  {
    title: '8. Future Updates',
    body: [
      'StartSmart is actively developed. Features may be added, changed, or removed as the product evolves. We will communicate significant changes through in-app notifications.',
      'We may update these Terms from time to time. Continued use of the Service after changes are posted constitutes acceptance of the updated Terms.',
      'Last updated: June 2026',
    ],
  },
];

const Terms = () => (
  <FooterPageShell>
    <div className="fp-hero">
      <div className="fp-badge">
        <span className="material-symbols-outlined">gavel</span>
        Legal
      </div>
      <h1 className="fp-title">Terms of Service</h1>
      <p className="fp-subtitle">
        Please read these terms before using StartSmart. They govern your access to and use of the Service.
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
          Questions about these Terms? Contact us at{' '}
          <a href="mailto:hello@startsmart-app.com" style={{ color: 'var(--color-secondary)' }}>hello@startsmart-app.com</a>
        </p>
      </div>
    </div>
  </FooterPageShell>
);

export default Terms;
