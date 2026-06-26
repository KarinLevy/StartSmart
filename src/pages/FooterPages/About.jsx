import React from 'react';
import FooterPageShell from '../../components/FooterPageShell/FooterPageShell';
import './FooterPage.css';

const TEAM = [
  { name: 'Maya Cohen',    role: 'Founder & CEO',       color: 'linear-gradient(135deg,#1e3a8a,#6b38d4)' },
  { name: 'Lior Ben-David',role: 'Head of Product',     color: 'linear-gradient(135deg,#0f766e,#0e7490)' },
  { name: 'Noa Shapiro',   role: 'Lead Engineer',       color: 'linear-gradient(135deg,#9d174d,#be185d)' },
  { name: 'Itay Katz',     role: 'Design Lead',         color: 'linear-gradient(135deg,#92400e,#b45309)' },
];

const PILLARS = [
  { icon: 'lightbulb',        label: 'Honest Estimation',    text: 'We built tools that surface the truth about where time actually goes.' },
  { icon: 'trending_up',      label: 'Continuous Growth',    text: 'Every session is a data point. Over time, patterns emerge and estimation improves.' },
  { icon: 'lock',             label: 'Privacy First',        text: 'Your productivity data is yours. We never sell it or use it for advertising.' },
  { icon: 'accessibility_new',label: 'Accessible by Default',text: 'StartSmart is designed to work for everyone, including keyboard and screen-reader users.' },
];

const initials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2);

const About = () => (
  <FooterPageShell>
    <div className="fp-hero">
      <div className="fp-badge">
        <span className="material-symbols-outlined">rocket_launch</span>
        Our story
      </div>
      <h1 className="fp-title">Built for people who think they&apos;re bad at time.</h1>
      <p className="fp-subtitle">
        StartSmart was born from a simple frustration: why does every task take longer than expected? We set out to answer that question with data, not guilt.
      </p>
    </div>

    <div className="fp-body">
      <div>
        <h2 className="fp-section-title">The Gap problem</h2>
        <p className="fp-text">
          Research consistently shows that humans are optimistic about time. We think a task will take 30 minutes and it takes 50. We call that delta the Gap. StartSmart makes the Gap visible so you can learn from it, shrink it over time, and schedule more realistically.
        </p>
        <p className="fp-text">
          Unlike typical to-do apps that just track whether something got done, StartSmart asks: how long did it actually take, and why did it differ from the plan?
        </p>
      </div>

      <div>
        <h2 className="fp-section-title">Our values</h2>
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

      <div>
        <h2 className="fp-section-title">Meet the team</h2>
        <div className="fp-team-grid">
          {TEAM.map((t) => (
            <div key={t.name} className="fp-team-card">
              <div className="fp-team-avatar" style={{ background: t.color }}>
                {initials(t.name)}
              </div>
              <div>
                <div className="fp-team-name">{t.name}</div>
                <div className="fp-team-role">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fp-card">
        <p className="fp-text">
          Want to join us? We&apos;re hiring. Reach out at{' '}
          <a href="mailto:careers@startsmart.app" style={{ color: 'var(--color-secondary)' }}>
            careers@startsmart.app
          </a>
        </p>
      </div>
    </div>
  </FooterPageShell>
);

export default About;
