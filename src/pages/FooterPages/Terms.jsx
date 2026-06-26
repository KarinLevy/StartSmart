import React from 'react';
import { Link } from 'react-router-dom';
import './FooterPage.css';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'By accessing or using StartSmart ("the Service"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the Service.',
    ],
  },
  {
    title: '2. Use of the Service',
    body: [
      'StartSmart is a productivity tool designed to help individuals track and improve how they estimate time. You may use the Service for lawful personal or professional purposes.',
    ],
    items: [
      'You must be at least 13 years old to use StartSmart',
      'You are responsible for maintaining the confidentiality of your account credentials',
      'You must not use the Service to store or transmit unlawful, harmful, or offensive content',
      'You must not attempt to reverse-engineer, scrape, or disrupt the Service',
    ],
  },
  {
    title: '3. Intellectual Property',
    body: [
      'All content, design, code, and branding in StartSmart are the intellectual property of StartSmart Inc. or its licensors. You may not copy, reproduce, or redistribute any part of the Service without written permission.',
      'Your task data and content remain yours. By submitting content to the Service you grant us a limited licence to process it solely to provide the Service to you.',
    ],
  },
  {
    title: '4. Beta Service Disclaimer',
    body: [
      'StartSmart is currently provided as a beta product. The Service is provided "as is" without warranties of any kind. We make no guarantees regarding uptime, data retention, or fitness for a particular purpose.',
      'Beta features may change, be removed, or behave unexpectedly. We recommend exporting important data regularly.',
    ],
  },
  {
    title: '5. Limitation of Liability',
    body: [
      'To the maximum extent permitted by applicable law, StartSmart Inc. shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.',
    ],
  },
  {
    title: '6. Termination',
    body: [
      'We reserve the right to suspend or terminate your account if you violate these Terms. You may close your account at any time from the Settings page.',
    ],
  },
  {
    title: '7. Changes to Terms',
    body: [
      'We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms. We will notify you of material changes via in-app notification.',
      'Last updated: June 2026',
    ],
  },
];

const Terms = () => (
  <div className="footer-page-layout">
    <main className="footer-page-content">
      <Link to="/" className="fp-back">
        <span className="material-symbols-outlined">arrow_back</span>
        Back to home
      </Link>

      <div className="fp-hero">
        <div className="fp-badge">
          <span className="material-symbols-outlined">gavel</span>
          Legal
        </div>
        <h1 className="fp-title">Terms of Service</h1>
        <p className="fp-subtitle">
          Please read these terms carefully before using StartSmart. They govern your access to and use of our service.
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
            <a href="mailto:legal@startsmart.app" style={{ color: 'var(--color-secondary)' }}>
              legal@startsmart.app
            </a>
          </p>
        </div>
      </div>
    </main>
  </div>
);

export default Terms;
