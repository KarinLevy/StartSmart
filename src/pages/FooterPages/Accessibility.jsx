import React from 'react';
import { Link } from 'react-router-dom';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import './FooterPage.css';

const FEATURES = [
  {
    icon: 'devices',
    label: 'Responsive Design',
    text: 'StartSmart is built to work on screens from 375px upwards — phones, tablets, and desktops. Layout and typography adapt to the available space so content remains readable at any size.',
  },
  {
    icon: 'keyboard',
    label: 'Keyboard Navigation',
    text: 'Interactive elements including buttons, links, forms, and dropdown menus are reachable and operable using a keyboard alone. Focus indicators are visible on all interactive controls.',
  },
  {
    icon: 'contrast',
    label: 'Colour Contrast',
    text: 'Text and interactive elements are designed with sufficient contrast against their backgrounds in both light and dark themes. We aim to meet WCAG AA contrast ratios for body text and UI controls.',
  },
  {
    icon: 'text_fields',
    label: 'Readable Typography',
    text: 'The application uses a clear type scale with legible font sizes throughout. Text does not break below 16px for body content and respects browser font-size preferences.',
  },
  {
    icon: 'label',
    label: 'Semantic Markup',
    text: 'Pages use semantic HTML elements, ARIA labels, and roles where appropriate. Form inputs are associated with descriptive labels. Icon-only buttons include accessible text for assistive technologies.',
  },
  {
    icon: 'dark_mode',
    label: 'Dark Mode',
    text: 'A built-in dark theme reduces eye strain in low-light environments and provides an alternative colour palette for users who prefer it or require it for readability.',
  },
];

const Accessibility = () => (
  <FooterPageShell>
    <div className="fp-hero">
      <div className="fp-badge">
        <span className="material-symbols-outlined">accessibility_new</span>
        Accessibility
      </div>
      <h1 className="fp-title">Designed to work for everyone.</h1>
      <p className="fp-subtitle">
        Accessibility is part of how StartSmart is built, not something added at the end. This page describes what is currently in place and what we are continuing to improve.
      </p>
    </div>

    <div className="fp-body">
      <div>
        <h2 className="fp-section-title">Our approach</h2>
        <p className="fp-text">
          We aim to make StartSmart usable by as many people as possible, regardless of device, ability, or context. That means writing semantic HTML, maintaining sufficient contrast, supporting keyboard navigation, and testing across different screen sizes.
        </p>
        <p className="fp-text">
          StartSmart has not yet undergone a formal third-party accessibility audit. We are transparent about that. The features listed below reflect genuine design decisions — not aspirational claims.
        </p>
      </div>

      <div>
        <h2 className="fp-section-title">What is in place</h2>
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
        <h2 className="fp-section-title">Ongoing improvements</h2>
        <p className="fp-text">
          Accessibility is not a checkbox — it requires ongoing attention as the application grows. We continue to review new features for keyboard operability, contrast compliance, and screen reader compatibility.
        </p>
        <p className="fp-text">
          Areas we are actively working on include improved skip-navigation links, more consistent focus management in modal dialogs, and expanded ARIA labelling for data visualisation elements.
        </p>
      </div>

      <div className="fp-card">
        <p className="fp-text">
          If you encounter an accessibility barrier or have a suggestion for improvement, please let us know at{' '}
          <a href="mailto:hello@startsmart-app.com" style={{ color: 'var(--color-secondary)' }}>hello@startsmart-app.com</a>{' '}
          or through our{' '}
          <Link to="/contact" style={{ color: 'var(--color-secondary)' }}>Contact page</Link>.
          All feedback is genuinely appreciated.
        </p>
      </div>
    </div>
  </FooterPageShell>
);

export default Accessibility;
