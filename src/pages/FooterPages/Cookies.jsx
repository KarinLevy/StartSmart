import React from 'react';
import { Link } from 'react-router-dom';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import './FooterPage.css';

const COOKIE_TYPES = [
  {
    icon: 'key',
    label: 'Authentication',
    required: true,
    text: 'A session cookie is set when you log in. It keeps you authenticated between page loads and is cleared when you log out or when the session expires. Without this cookie, the application cannot function.',
  },
  {
    icon: 'tune',
    label: 'Preferences',
    required: true,
    text: 'A small cookie stores your display preferences, such as your selected theme (light or dark). This means your settings persist when you return to the application.',
  },
  {
    icon: 'bar_chart',
    label: 'Analytics',
    required: false,
    text: 'StartSmart does not currently use third-party analytics cookies. If this changes in the future, this policy will be updated and users will be informed in advance.',
  },
  {
    icon: 'block',
    label: 'Advertising',
    required: false,
    text: 'StartSmart does not use advertising cookies of any kind. No tracking pixels or third-party advertising scripts are loaded.',
  },
];

const Cookies = () => (
  <FooterPageShell>
    <div className="fp-hero">
      <div className="fp-badge">
        <span className="material-symbols-outlined">cookie</span>
        Legal
      </div>
      <h1 className="fp-title">Cookies Policy</h1>
      <p className="fp-subtitle">
        StartSmart uses a minimal set of cookies — only what is necessary to run the application and remember your preferences.
      </p>
    </div>

    <div className="fp-body">
      <div>
        <h2 className="fp-section-title">What are cookies?</h2>
        <p className="fp-text">
          Cookies are small text files stored in your browser when you visit a website. They are used to remember information between visits or to keep you logged in during a session.
        </p>
      </div>

      <div>
        <h2 className="fp-section-title">Cookies StartSmart uses</h2>
        <div className="fp-card-grid">
          {COOKIE_TYPES.map((c) => (
            <div key={c.label} className="fp-icon-card" style={{ flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="fp-icon-card-icon">
                  <span className="material-symbols-outlined">{c.icon}</span>
                </div>
                <div>
                  <div className="fp-icon-card-label">{c.label}</div>
                  <div style={{ fontSize: 'var(--font-size-label-sm)', color: c.required ? 'var(--color-secondary)' : 'var(--color-on-surface-variant)', marginTop: '0.1rem' }}>
                    {c.required ? 'Essential' : 'Not used'}
                  </div>
                </div>
              </div>
              <div className="fp-icon-card-text">{c.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="fp-section-title">Managing cookies</h2>
        <p className="fp-text">
          Essential cookies cannot be disabled without breaking core functionality. If you prefer not to accept any cookies, you can clear them at any time from your browser settings — however, doing so will log you out and reset your preferences.
        </p>
        <p className="fp-text">
          Most browsers allow you to view, block, or delete cookies through their privacy or security settings. Refer to your browser's documentation for specific instructions.
        </p>
      </div>

      <div className="fp-card">
        <p className="fp-text">
          Questions about how we use cookies? Visit our{' '}
          <Link to="/privacy-policy" style={{ color: 'var(--color-secondary)' }}>Privacy Policy</Link>{' '}
          or{' '}
          <Link to="/contact" style={{ color: 'var(--color-secondary)' }}>contact us</Link>.
        </p>
        <p className="fp-text" style={{ marginTop: '0.5rem' }}>Last updated: June 2026</p>
      </div>
    </div>
  </FooterPageShell>
);

export default Cookies;
