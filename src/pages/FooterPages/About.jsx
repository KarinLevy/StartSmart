import React from 'react';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import './FooterPage.css';

const PILLARS = [
  { icon: 'lightbulb',         label: 'Honest Estimation',     text: 'Surface the real picture of where time goes, without judgment.' },
  { icon: 'trending_up',       label: 'Continuous Improvement', text: 'Every session is a data point. Patterns emerge and planning improves over time.' },
  { icon: 'lock',              label: 'Privacy First',          text: 'Your productivity data is yours. It is never sold or used for advertising.' },
  { icon: 'accessibility_new', label: 'Accessible by Default',  text: 'StartSmart is designed to work for everyone, on any device and screen size.' },
];

const FOR_WHO = [
  { icon: 'school',        label: 'Students' },
  { icon: 'work',          label: 'Employees' },
  { icon: 'groups',        label: 'Managers' },
  { icon: 'laptop_mac',    label: 'Freelancers' },
  { icon: 'family_restroom', label: 'Parents' },
  { icon: 'person',        label: 'Anyone who wants better focus' },
];

const About = () => (
  <FooterPageShell>
    <div className="fp-hero">
      <div className="fp-badge">
        <span className="material-symbols-outlined">rocket_launch</span>
        About StartSmart
      </div>
      <h1 className="fp-title">A personal project that grew into something real.</h1>
      <p className="fp-subtitle">
        StartSmart started as a university assignment. It became something I genuinely needed in my own life.
      </p>
    </div>

    <div className="fp-body">
      <div>
        <h2 className="fp-section-title">The story</h2>
        <p className="fp-text">
          My name is Karin Levy. I am 23 years old and I study Business Administration with a specialization in Information Systems at Ono Academic College.
        </p>
        <p className="fp-text">
          StartSmart began during a Web Development course. The assignment was straightforward: identify a real problem from your own life and build something to address it. I did not have to think for long.
        </p>
        <p className="fp-text">
          I have always struggled with procrastination, focus, and time management. Poor planning meant tasks piled up, stress built quietly in the background, and deadlines arrived faster than expected. I was not bad at working — I was bad at planning. And no existing tool I tried actually helped me get better at it.
        </p>
        <p className="fp-text">
          So instead of building a theoretical project, I built something I personally needed. Over time, what started as a course deliverable evolved into a full productivity application with task tracking, a Focus Mode timer, scheduling, detailed statistics, and achievement tracking. It became far bigger than any assignment.
        </p>
      </div>

      <div>
        <h2 className="fp-section-title">Mission</h2>
        <p className="fp-text">
          StartSmart exists to help people regain control of their time. Not through rigid systems or guilt-driven dashboards, but through clear, honest data about how time is actually spent.
        </p>
        <p className="fp-text">
          The goal is to make planning feel less overwhelming — to reduce the friction between intention and action, shrink procrastination, and help people build sustainable productivity habits that hold up under real-life pressure.
        </p>
      </div>

      <div>
        <h2 className="fp-section-title">Vision</h2>
        <p className="fp-text">
          The long-term vision is a productivity platform that helps people work smarter over time — one that learns from their patterns, surfaces useful insights, and makes it genuinely easier to achieve goals with less stress.
        </p>
        <p className="fp-text">
          Future versions of StartSmart will include intelligent features that adapt to how each person plans and works. The foundation is already being built carefully, with real users and real data guiding every decision.
        </p>
      </div>

      <div>
        <h2 className="fp-section-title">Who StartSmart is for</h2>
        <p className="fp-text" style={{ marginBottom: '1.25rem' }}>
          StartSmart is designed for anyone who wants better focus and time management — regardless of profession or background.
        </p>
        <div className="fp-card-grid">
          {FOR_WHO.map((w) => (
            <div key={w.label} className="fp-icon-card">
              <div className="fp-icon-card-icon">
                <span className="material-symbols-outlined">{w.icon}</span>
              </div>
              <div className="fp-icon-card-label" style={{ alignSelf: 'center' }}>{w.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="fp-section-title">What guides this project</h2>
        <div className="fp-card-grid">
          {PILLARS.map((p) => (
            <div key={p.label} className="fp-icon-card">
              <div className="fp-icon-card-icon">
                <span className="material-symbols-outlined">{p.icon}</span>
              </div>
              <div>
                <div className="fp-icon-card-label">{p.label}</div>
                <div className="fp-icon-card-text">{p.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fp-card">
        <p className="fp-text">
          Thank you for taking the time to explore StartSmart. This project means a great deal to me, and I hope it helps you feel more in control of your time and goals — even just a little.
        </p>
        <p className="fp-text" style={{ marginTop: '0.75rem' }}>
          Have thoughts or feedback? I would love to hear from you at{' '}
          <a href="mailto:hello@startsmart-app.com" style={{ color: 'var(--color-secondary)' }}>
            hello@startsmart-app.com
          </a>
        </p>
      </div>
    </div>
  </FooterPageShell>
);

export default About;
