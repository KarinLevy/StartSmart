import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FooterPage.css';

const FAQS = [
  {
    q: 'What is StartSmart?',
    a: 'StartSmart is a productivity app that tracks the Gap between how long you think tasks will take and how long they actually take. By making that delta visible, it helps you schedule more accurately over time.',
  },
  {
    q: 'What is "the Gap"?',
    a: 'The Gap is the difference between your estimated time and your actual time for a task. A positive Gap (+7 min) means the task ran over. A negative Gap means you finished early. StartSmart shows your Gap trends so you can improve your planning.',
  },
  {
    q: 'Is StartSmart free to use?',
    a: 'Yes — StartSmart has a free tier that includes unlimited task tracking, focus sessions, and basic statistics. A Pro plan with advanced insights, calendar integrations, and team features is coming soon.',
  },
  {
    q: 'Is my data private?',
    a: 'Absolutely. Your productivity data is yours and is never sold or shared with third parties. During the current beta, all data is stored locally in your browser. See our Privacy Policy for full details.',
  },
  {
    q: 'How does the Focus Mode timer work?',
    a: 'When you start a Focus session on a task, a countdown timer runs against your estimated time. When you finish, StartSmart records the actual duration, computes the Gap, and saves it to your task history.',
  },
  {
    q: 'Can I edit or delete tasks?',
    a: 'Yes. Open any task from the Dashboard or Task History and click Edit. You can update the title, description, estimated time, scheduled date, and priority. You can also delete a task from the Task Details page.',
  },
  {
    q: 'Does StartSmart work on mobile?',
    a: 'Yes — StartSmart is fully responsive and works on screens as small as 375px. We recommend adding it to your home screen as a PWA for the best mobile experience.',
  },
  {
    q: 'Will there be calendar integration?',
    a: "Google Calendar and Apple Calendar integrations are on our roadmap. In the meantime, the Schedule view lets you plan tasks by day, week, and month within StartSmart.",
  },
  {
    q: 'How do I reset my password?',
    a: "Visit the Login page and click 'Forgot password?'. Enter your email and we'll send you a reset link.",
  },
  {
    q: 'How can I contact support?',
    a: 'You can reach us via our Contact page or email support@startsmart.app. We typically respond within 24 hours.',
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button
        className="faq-question"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {q}
        <span className={`material-symbols-outlined faq-chevron${open ? ' open' : ''}`} aria-hidden="true">
          expand_more
        </span>
      </button>
      {open && <div className="faq-answer">{a}</div>}
    </div>
  );
};

const FAQ = () => (
  <div className="footer-page-layout">
    <main className="footer-page-content">
      <Link to="/" className="fp-back">
        <span className="material-symbols-outlined">arrow_back</span>
        Back to home
      </Link>

      <div className="fp-hero">
        <div className="fp-badge">
          <span className="material-symbols-outlined">help</span>
          Help
        </div>
        <h1 className="fp-title">Frequently Asked Questions</h1>
        <p className="fp-subtitle">
          Everything you need to know about StartSmart. Can&apos;t find an answer?{' '}
          <Link to="/contact" style={{ color: 'var(--color-secondary)' }}>Contact us</Link>.
        </p>
      </div>

      <div className="fp-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
        </div>
      </div>
    </main>
  </div>
);

export default FAQ;
