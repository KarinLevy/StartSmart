import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import './FooterPage.css';

const SECTIONS = [
  {
    icon: 'play_circle',
    title: 'Getting Started',
    items: [
      { q: 'How do I create an account?', a: 'Open StartSmart and click "Get started" on the home page. Enter your name, email address, and a password, then confirm your email when the verification link arrives.' },
      { q: 'How do I log in?', a: 'Click "Log in" and enter your email and password. If you forgot your password, use the "Forgot password?" link to receive a reset email.' },
      { q: 'How do I change my theme?', a: 'Open your Profile page and toggle between Light and Dark mode under the Appearance section.' },
    ],
  },
  {
    icon: 'task_alt',
    title: 'Tasks',
    items: [
      { q: 'How do I create a task?', a: 'Click the "+" button from the Dashboard or navigate to Create Task. Fill in the title, estimated time, priority, optional due date, and any tags, then save.' },
      { q: 'How do I edit a task?', a: 'Open the task from your Dashboard or Task History and click the Edit button. You can update all task fields, including the estimated time and scheduled date.' },
      { q: 'How do I delete a task?', a: 'Open the task and choose Delete from the options menu. Deleted tasks are moved to a soft-delete state and removed from your active lists.' },
      { q: 'What are tags?', a: 'Tags let you categorise tasks (e.g. Study, Work, Personal). They are used to group tasks in statistics and calculate focus time per category for achievements.' },
    ],
  },
  {
    icon: 'timer',
    title: 'Focus Mode',
    items: [
      { q: 'How do I start a focus session?', a: 'From the Dashboard or a task detail page, click "Start Focus". The timer will count down from your estimated duration. You can pause or end the session at any time.' },
      { q: 'What happens when the timer ends?', a: 'StartSmart records the actual time you spent and saves it against the task. The gap between estimated and actual time is then visible in your statistics.' },
      { q: 'Can I take breaks during a session?', a: 'Yes. Use the pause button to log a break. Break time is tracked separately and not counted as focus time.' },
    ],
  },
  {
    icon: 'calendar_month',
    title: 'Schedule',
    items: [
      { q: 'How does the Schedule view work?', a: 'The Schedule shows your tasks organised by day, week, or month. Switch views using the controls at the top. Click a task to open it, or navigate to a different date using the arrows.' },
      { q: 'Can I drag tasks between days?', a: 'You can reschedule a task by editing it and changing its scheduled date. Direct drag-and-drop scheduling is planned for a future update.' },
    ],
  },
  {
    icon: 'bar_chart',
    title: 'Statistics',
    items: [
      { q: 'What do the statistics show?', a: 'Statistics display your task completion rate, focus time by category, estimation accuracy, gap trends, and productivity patterns over time. All values are calculated from your real task data.' },
      { q: 'Why are my statistics empty?', a: 'Statistics require completed tasks with logged focus time. Complete a few tasks using Focus Mode and your charts will populate automatically.' },
    ],
  },
  {
    icon: 'person',
    title: 'Profile & Settings',
    items: [
      { q: 'How do I update my profile?', a: 'Go to your Profile page to update your display name, avatar, role, and timezone. Changes are saved instantly.' },
      { q: 'How do I change my notification preferences?', a: 'Notification settings are available in the Settings section of your profile. You can control which types of alerts you receive.' },
    ],
  },
  {
    icon: 'lock_reset',
    title: 'Password Recovery',
    items: [
      { q: 'I forgot my password. What do I do?', a: 'On the Login page, click "Forgot password?" and enter your email address. You will receive a reset link shortly. Check your spam folder if it does not arrive within a few minutes.' },
      { q: 'The reset link is not working.', a: 'Password reset links expire after a short period for security. If the link has expired, request a new one from the Login page. If the problem persists, contact support.' },
    ],
  },
  {
    icon: 'support_agent',
    title: 'Contact Support',
    items: [
      { q: 'How do I report a bug?', a: 'Use the Contact page and select "Bug report" as the topic. Please describe what you did, what you expected to happen, and what actually happened. Screenshots are helpful.' },
      { q: 'How quickly will I get a response?', a: 'We aim to respond to all enquiries within 24 hours on business days. For urgent issues, email support@startsmart-app.com directly.' },
    ],
  },
];

const HelpSection = ({ icon, title, items }) => {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.875rem' }}>
        <div className="fp-icon-card-icon" style={{ flexShrink: 0 }}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h2 className="fp-section-title" style={{ margin: 0 }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((item, i) => (
          <div key={i} className="faq-item">
            <button
              className="faq-question"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
            >
              {item.q}
              <span className={`material-symbols-outlined faq-chevron${openIndex === i ? ' open' : ''}`} aria-hidden="true">expand_more</span>
            </button>
            {openIndex === i && <div className="faq-answer">{item.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

const HelpCenter = () => (
  <FooterPageShell>
    <div className="fp-hero">
      <div className="fp-badge">
        <span className="material-symbols-outlined">menu_book</span>
        Help Center
      </div>
      <h1 className="fp-title">How can we help?</h1>
      <p className="fp-subtitle">
        Find answers to common questions about using StartSmart. Still stuck?{' '}
        <Link to="/contact" style={{ color: 'var(--color-secondary)' }}>Contact us</Link> and we will help you out.
      </p>
    </div>

    <div className="fp-body">
      {SECTIONS.map((s) => (
        <HelpSection key={s.title} {...s} />
      ))}
    </div>
  </FooterPageShell>
);

export default HelpCenter;
