import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import './FooterPage.css';

const FAQS = [
  {
    q: 'What is StartSmart?',
    a: 'StartSmart is a personal productivity application that helps you plan tasks, track focus time, and understand where your time actually goes. It combines task management, a Focus Mode timer, a weekly/monthly schedule, and statistics — all in one place.',
  },
  {
    q: 'Who is StartSmart designed for?',
    a: 'Anyone who wants better focus and time management. That includes students balancing coursework, employees managing projects, freelancers tracking billable hours, managers coordinating work, and anyone else who finds planning stressful or unreliable.',
  },
  {
    q: 'How does Focus Mode work?',
    a: 'Focus Mode runs a countdown timer against your task\'s estimated time. When you start a session, the timer counts down and tracks how long you actually work. When you finish, StartSmart saves the real duration alongside your estimate — giving you an accurate picture of how you plan versus how you perform.',
  },
  {
    q: 'How are productivity insights generated?',
    a: 'All insights are calculated directly from your task history — completed tasks, focus session durations, estimated vs. actual times, and tag categories. Nothing is manually set or hardcoded. The more you use StartSmart, the more accurate and useful your insights become.',
  },
  {
    q: 'Is StartSmart free to use?',
    a: 'Yes. StartSmart is free for all core features including unlimited task tracking, Focus Mode, scheduling, and statistics. A Pro plan with additional capabilities is available for users who want more.',
  },
  {
    q: 'How do I reset my password?',
    a: 'On the Login page, click "Forgot password?" and enter your email address. You will receive a reset link within a few minutes. Check your spam folder if it does not arrive.',
  },
  {
    q: 'Can I export my data?',
    a: 'Data export is on the roadmap and will be available in a future update. You will be able to export your task history and focus logs as a structured file.',
  },
  {
    q: 'Can I change the application language?',
    a: 'Multi-language support is currently in development. English is the default language. Additional language options will be available in a future release.',
  },
  {
    q: 'Is my information secure?',
    a: 'Yes. StartSmart uses Supabase for authentication and data storage. All data is encrypted in transit using TLS and at rest. Your productivity data is never sold or shared with third parties. See our Privacy Policy for full details.',
  },
  {
    q: 'How do I contact support?',
    a: 'You can reach us via the Contact page or by emailing support@startsmart-app.com. We aim to respond within 24 hours on business days.',
  },
];

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

const FAQ = () => (
  <FooterPageShell>
    <div className="fp-hero">
      <div className="fp-badge">
        <span className="material-symbols-outlined">help</span>
        FAQ
      </div>
      <h1 className="fp-title">Frequently Asked Questions</h1>
      <p className="fp-subtitle">
        Quick answers to common questions. Need more help?{' '}
        <Link to="/help" style={{ color: 'var(--color-secondary)' }}>Visit the Help Center</Link>{' '}
        or{' '}
        <Link to="/contact" style={{ color: 'var(--color-secondary)' }}>contact us</Link>.
      </p>
    </div>

    <div className="fp-body">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
      </div>
    </div>
  </FooterPageShell>
);

export default FAQ;
