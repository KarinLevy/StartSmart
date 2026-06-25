import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './landing.css';

/* ── Scroll-fade hook ── */
function useFadeIn(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
}

function FadeSection({ children, className = '' }) {
  const ref = useRef(null);
  useFadeIn(ref);
  return <div ref={ref} className={`lp-fade-up ${className}`}>{children}</div>;
}

/* ── Marketing Nav ── */
function MarketingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="lp-nav">
      <div className="lp-nav-inner">
        <Link to="/" className="lp-nav-logo" aria-label="StartSmart home">
          <div className="lp-nav-logo-icon">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <span className="lp-nav-logo-text">StartSmart</span>
        </Link>

        <nav className="lp-nav-links" aria-label="Main navigation">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#how" className="lp-nav-link">How it works</a>
        </nav>

        <div className="lp-nav-actions">
          <Link to="/login" className="lp-btn-ghost">Log in</Link>
          <Link to="/register" className="lp-btn-primary">Start free</Link>
        </div>

        <button
          className="lp-nav-hamburger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`lp-nav-mobile-menu ${open ? '' : 'hidden'}`} aria-hidden={!open}>
        <a href="#features" className="lp-nav-mobile-link" onClick={() => setOpen(false)}>Features</a>
        <a href="#how" className="lp-nav-mobile-link" onClick={() => setOpen(false)}>How it works</a>
        <div className="lp-nav-mobile-actions">
          <Link to="/login" className="lp-btn-ghost" onClick={() => setOpen(false)}>Log in</Link>
          <Link to="/register" className="lp-btn-primary" onClick={() => setOpen(false)}>Start free</Link>
        </div>
      </div>
    </header>
  );
}

/* ── Gap Card ── */
function GapCard() {
  return (
    <div className="lp-gap-card" role="img" aria-label="Example task showing 45 minute estimate vs 52 minute actual — a 7-minute gap">
      <div className="lp-gap-card-header">
        <span className="lp-gap-card-title">Active Task</span>
        <span className="lp-gap-card-badge">● In progress</span>
      </div>
      <p className="lp-gap-task-name">Prepare Q3 Report</p>

      <div className="lp-gap-bars">
        <div className="lp-bar-row">
          <div className="lp-bar-label-row">
            <span className="lp-bar-label">Planned</span>
            <span className="lp-bar-value">45 min</span>
          </div>
          <div className="lp-bar-track">
            <div className="lp-bar-fill planned" />
          </div>
        </div>
        <div className="lp-bar-row">
          <div className="lp-bar-label-row">
            <span className="lp-bar-label">Actual</span>
            <span className="lp-bar-value">52 min</span>
          </div>
          <div className="lp-bar-track">
            <div className="lp-bar-fill actual" />
          </div>
        </div>
      </div>

      <div className="lp-gap-highlight">
        <span className="lp-gap-pill">+7 min</span>
        <span className="lp-gap-insight">You consistently underestimate reports. Try adding a buffer next time.</span>
      </div>
    </div>
  );
}

/* ── Landing Page ── */
const LandingPage = () => {
  return (
    <div className="lp-wrapper">
      <MarketingNav />

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-left">
            <span className="lp-eyebrow">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>bolt</span>
              Smart &amp; Futuristic Productivity
            </span>
            <h1 className="lp-headline">
              Stop guessing how long{' '}
              <span className="gradient-text">tasks actually take.</span>
            </h1>
            <p className="lp-subhead">
              StartSmart tracks the gap between your estimate and reality — so every session
              makes you a smarter planner. Estimate first, focus fully, learn constantly.
            </p>
            <div className="lp-cta-row">
              <Link to="/register" className="lp-btn-hero-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>rocket_launch</span>
                Start free
              </Link>
              <Link to="/login" className="lp-btn-hero-secondary">
                Log in
              </Link>
            </div>
          </div>
          <GapCard />
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="lp-section">
        <FadeSection>
          <div className="lp-section-header">
            <span className="lp-eyebrow">Sound familiar?</span>
            <h2 className="lp-headline" style={{ textAlign: 'center', maxWidth: '560px' }}>
              We all lie to ourselves about time
            </h2>
          </div>
        </FadeSection>
        <div className="lp-problem-grid">
          <FadeSection>
            <div className="lp-problem-card">
              <div className="lp-problem-emoji">😅</div>
              <p className="lp-problem-quote">I'll just start it later…</p>
              <p className="lp-problem-sub">Tasks expand to fill whatever time you didn't plan for them.</p>
            </div>
          </FadeSection>
          <FadeSection>
            <div className="lp-problem-card">
              <div className="lp-problem-emoji">⏳</div>
              <p className="lp-problem-quote">This'll take twenty minutes.</p>
              <p className="lp-problem-sub">Three hours later, you're still at it — and wondering why the day vanished.</p>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="lp-section lp-features-section">
        <FadeSection>
          <div className="lp-section-header">
            <span className="lp-eyebrow">What you get</span>
            <h2 className="lp-headline" style={{ textAlign: 'center' }}>
              Everything you need to close the gap
            </h2>
          </div>
        </FadeSection>
        <div className="lp-features-grid">
          {[
            { icon: 'touch_app', title: 'One-tap start', desc: 'Hit start and the timer rolls — zero friction between intention and action.' },
            { icon: 'edit_note', title: 'Estimate first', desc: 'Set a time estimate before you begin, so every task starts with an honest commitment.' },
            { icon: 'timer', title: 'Focus Mode', desc: 'Full-screen timer with DND ambient audio. Nothing distracts you from the work.' },
            { icon: 'query_stats', title: 'See the gap', desc: 'After each session, see exactly how your estimate compared to reality — and trend lines over time.' },
          ].map((f) => (
            <FadeSection key={f.title}>
              <div className="lp-feature-card">
                <div className="lp-feature-icon">
                  <span className="material-symbols-outlined">{f.icon}</span>
                </div>
                <p className="lp-feature-title">{f.title}</p>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="lp-section">
        <FadeSection>
          <div className="lp-section-header">
            <span className="lp-eyebrow">How it works</span>
            <h2 className="lp-headline" style={{ textAlign: 'center' }}>
              Three steps to smarter days
            </h2>
          </div>
        </FadeSection>
        <div className="lp-how-grid">
          {[
            { n: '1', title: 'Plan', desc: "Create your task and set an honest time estimate. No vague \"I'll handle it\" — commit to a number." },
            { n: '2', title: 'Focus', desc: "Enter Focus Mode. The timer runs, notifications sleep, and you work. It's just you and the task." },
            { n: '3', title: 'Learn', desc: "When you finish, see the gap. Over time those gaps shrink — and your planning gets sharper." },
          ].map((s) => (
            <FadeSection key={s.n}>
              <div className="lp-how-step">
                <div className="lp-how-number">{s.n}</div>
                <p className="lp-how-step-title">{s.title}</p>
                <p className="lp-how-step-desc">{s.desc}</p>
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp-cta-banner">
        <div className="lp-cta-banner-inner">
          <h2 className="lp-cta-banner-title">Ready to close your gap?</h2>
          <p className="lp-cta-banner-sub">
            Join the planners who already know where their time really goes.
          </p>
          <div className="lp-cta-banner-actions">
            <Link to="/register" className="lp-btn-banner-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rocket_launch</span>
              Start free
            </Link>
            <Link to="/login" className="lp-btn-banner-ghost">Log in</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <Link to="/" className="lp-footer-brand">
            <span className="material-symbols-outlined">rocket_launch</span>
            StartSmart
          </Link>
          <nav className="lp-footer-links" aria-label="Footer navigation">
            <a href="#features" className="lp-footer-link">Features</a>
            <a href="#how" className="lp-footer-link">How it works</a>
            <Link to="/login" className="lp-footer-link">Log in</Link>
            <Link to="/register" className="lp-footer-link">Sign up</Link>
          </nav>
          <span className="lp-footer-copy">© {new Date().getFullYear()} StartSmart</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
