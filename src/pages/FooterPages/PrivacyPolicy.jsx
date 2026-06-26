import React from 'react';
import { Link } from 'react-router-dom';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import './FooterPage.css';

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: [
      'When you create an account, we collect your email address and, if provided, your display name. This information is used solely to identify your account and personalise your experience.',
      'We also collect the data you create within StartSmart — task titles, descriptions, estimated and actual durations, focus session records, tags, and scheduling information. This data is used to calculate your productivity statistics and power the insights shown in the application.',
    ],
  },
  {
    title: 'Authentication',
    body: [
      'StartSmart uses Supabase Auth to handle user authentication. When you sign in, Supabase issues a secure session token that is stored in your browser. We do not store your password — it is hashed and managed by Supabase.',
      'Password reset emails are sent via Supabase using the email address associated with your account.',
    ],
  },
  {
    title: 'Data Storage',
    body: [
      'All user data is stored in a Supabase-managed PostgreSQL database. Data is protected by row-level security, meaning each user can only access their own records.',
      'Your data is stored on Supabase infrastructure and is subject to Supabase\'s own security and compliance standards. You can learn more at supabase.com/security.',
    ],
  },
  {
    title: 'Cookies',
    body: [
      'StartSmart uses only essential cookies — specifically, a session cookie required to keep you logged in. We do not use advertising cookies, tracking pixels, or third-party analytics cookies.',
      'You can review full details on our Cookies page.',
    ],
  },
  {
    title: 'How We Use Your Information',
    body: [
      'Your data is used only to provide and improve the StartSmart service. Specifically:',
    ],
    items: [
      'Display your tasks, schedule, and focus history',
      'Calculate productivity statistics, gap analysis, and achievement progress',
      'Send in-app notifications related to your account and tasks',
      'Respond to support enquiries you submit through the Contact page',
    ],
  },
  {
    title: 'Data Sharing',
    body: [
      'We do not sell, rent, or share your personal data with any third parties for commercial or advertising purposes. The only third-party service that processes your data is Supabase, which acts as our database and authentication provider.',
    ],
  },
  {
    title: 'Your Rights',
    body: [
      'You have the right to access, correct, or delete the data associated with your account at any time.',
    ],
    items: [
      'Access — view your profile and task data from within the application',
      'Correction — update your name, email, and preferences in Settings',
      'Erasure — request full account and data deletion by contacting us',
      'Portability — data export will be available in a future update',
    ],
  },
  {
    title: 'Account Deletion',
    body: [
      'To delete your account and all associated data, please contact us at support@startsmart-app.com. We will process your request within 14 days and confirm once complete.',
    ],
  },
  {
    title: 'Security',
    body: [
      'All data is encrypted in transit using TLS. Data at rest is protected by Supabase\'s AES-256 encryption. Row-level security ensures that no user can read or modify another user\'s data.',
      'We take security seriously and review our implementation regularly. If you discover a potential vulnerability, please report it to support@startsmart-app.com.',
    ],
  },
  {
    title: 'Changes to This Policy',
    body: [
      'We may update this Privacy Policy as the application evolves. When significant changes are made, we will notify you via an in-app message and update the date below.',
      'Last updated: June 2026',
    ],
  },
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
        This policy explains what data StartSmart collects, how it is used, and the controls you have over it.
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
          Questions about this policy? Contact us at{' '}
          <a href="mailto:support@startsmart-app.com" style={{ color: 'var(--color-secondary)' }}>support@startsmart-app.com</a>{' '}
          or visit our <Link to="/contact" style={{ color: 'var(--color-secondary)' }}>Contact page</Link>.
        </p>
      </div>
    </div>
  </FooterPageShell>
);

export default PrivacyPolicy;
