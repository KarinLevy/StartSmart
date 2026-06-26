import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import Footer from '../../components/Footer/Footer';
import './landing.css';

/* ── Scroll-fade hook ── */
function useFadeIn(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.12 }
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

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!e.target.closest('.lp-nav')) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <header className="lp-nav">
      <div className="lp-nav-inner">
        {/* Logo */}
        <Link to="/" className="lp-nav-logo" aria-label="StartSmart home">
          <div className="lp-nav-logo-icon" aria-hidden="true">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <span className="lp-nav-logo-text">StartSmart</span>
        </Link>

        {/* Desktop links */}
        <nav className="lp-nav-links" aria-label="Site navigation">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#how" className="lp-nav-link">How it works</a>
        </nav>

        {/* Desktop actions */}
        <div className="lp-nav-actions">
          <ThemeToggle />
          <Link to="/login" className="lp-btn-login">Log in</Link>
          <Link to="/register" className="lp-btn-primary">Sign up free</Link>
        </div>

        {/* Mobile hamburger */}
        <div className="lp-nav-mobile-right">
          <ThemeToggle />
          <button
            className="lp-nav-hamburger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="lp-mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {open ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        id="lp-mobile-menu"
        className={`lp-nav-mobile-menu${open ? ' open' : ''}`}
        aria-hidden={!open}
      >
        <a href="#features" className="lp-nav-mobile-link" onClick={() => setOpen(false)}>Features</a>
        <a href="#how" className="lp-nav-mobile-link" onClick={() => setOpen(false)}>How it works</a>
        <div className="lp-nav-mobile-divider" />
        <div className="lp-nav-mobile-actions">
          <Link to="/login" className="lp-btn-login" style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }} onClick={() => setOpen(false)}>Log in</Link>
          <Link to="/register" className="lp-btn-primary" style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }} onClick={() => setOpen(false)}>Sign up</Link>
        </div>
      </div>
    </header>
  );
}

/* ── Gap Card — Hero signature element ── */
function GapCard() {
  return (
    <div
      className="lp-gap-card"
      role="img"
      aria-label="Example task: Prepare Q3 Report — planned 45 min, actual 52 min, gap +7 minutes"
    >
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
          <div className="lp-bar-track" role="presentation">
            <div className="lp-bar-fill planned" />
          </div>
        </div>
        <div className="lp-bar-row">
          <div className="lp-bar-label-row">
            <span className="lp-bar-label">Actual</span>
            <span className="lp-bar-value">52 min</span>
          </div>
          <div className="lp-bar-track" role="presentation">
            <div className="lp-bar-fill actual" />
          </div>
        </div>
      </div>

      <div className="lp-gap-highlight">
        <span className="lp-gap-pill" aria-label="7 minutes over estimate">+7 min</span>
        <span className="lp-gap-insight">
          You consistently underestimate reports. Try adding a buffer next time.
        </span>
      </div>
    </div>
  );
}

/* ── Main Landing Page ── */
const LandingPage = () => (
  <div className="lp-wrapper">
    <MarketingNav />

    {/* ── Hero ── */}
    <section className="lp-hero" aria-labelledby="hero-headline">
      <div className="lp-hero-inner">
        <div className="lp-hero-left">
          <span className="lp-eyebrow" aria-hidden="true">
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>bolt</span>
            Smart &amp; Futuristic Productivity
          </span>
          <h1 className="lp-headline" id="hero-headline">
            Stop guessing how long{' '}
            <span className="gradient-text">tasks actually take.</span>
          </h1>
          <p className="lp-subhead">
            StartSmart tracks the gap between your estimate and reality — so every session
            makes you a sharper planner. Estimate first, focus fully, learn constantly.
          </p>
          <div className="lp-cta-row">
            <Link to="/register" className="lp-btn-hero-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">rocket_launch</span>
              Sign up free
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
    <section className="lp-section" aria-labelledby="problem-heading">
      <FadeSection>
        <div className="lp-section-header">
          <span className="lp-eyebrow">Sound familiar?</span>
          <h2 className="lp-headline" id="problem-heading" style={{ textAlign: 'center', maxWidth: '520px' }}>
            We all lie to ourselves about time
          </h2>
        </div>
      </FadeSection>
      <div className="lp-problem-grid">
        <FadeSection>
          <div className="lp-problem-card">
            <div className="lp-problem-emoji" aria-hidden="true">😅</div>
            <p className="lp-problem-quote">"I'll just start it later…"</p>
            <p className="lp-problem-sub">Tasks expand to fill whatever time you didn't plan for them.</p>
          </div>
        </FadeSection>
        <FadeSection>
          <div className="lp-problem-card">
            <div className="lp-problem-emoji" aria-hidden="true">⏳</div>
            <p className="lp-problem-quote">"This'll take twenty minutes."</p>
            <p className="lp-problem-sub">Three hours later, you're still at it — wondering where the day went.</p>
          </div>
        </FadeSection>
      </div>
    </section>

    {/* ── Features ── */}
    <section id="features" className="lp-section lp-features-section" aria-labelledby="features-heading">
      <FadeSection>
        <div className="lp-section-header">
          <span className="lp-eyebrow">What you get</span>
          <h2 className="lp-headline" id="features-heading" style={{ textAlign: 'center' }}>
            Everything you need to close the gap
          </h2>
        </div>
      </FadeSection>
      <div className="lp-features-grid">
        {[
          { icon: 'touch_app',   title: 'One-tap start',  desc: 'Hit start and the timer rolls — zero friction between intention and action.' },
          { icon: 'edit_note',   title: 'Estimate first', desc: 'Set a time estimate before you begin, so every task starts with a real commitment.' },
          { icon: 'timer',       title: 'Focus Mode',     desc: 'Full-screen timer with DND. Nothing distracts you from the work.' },
          { icon: 'query_stats', title: 'See the gap',    desc: 'After each session, see how your estimate compared to reality — and trend over time.' },
        ].map((f) => (
          <FadeSection key={f.title}>
            <div className="lp-feature-card">
              <div className="lp-feature-icon" aria-hidden="true">
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
    <section id="how" className="lp-section" aria-labelledby="how-heading">
      <FadeSection>
        <div className="lp-section-header">
          <span className="lp-eyebrow">How it works</span>
          <h2 className="lp-headline" id="how-heading" style={{ textAlign: 'center' }}>
            Three steps to smarter days
          </h2>
        </div>
      </FadeSection>
      <ol className="lp-how-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {[
          { n: '1', title: 'Plan',  desc: "Create your task and set an honest time estimate. No vague 'I'll handle it' — commit to a number." },
          { n: '2', title: 'Focus', desc: "Enter Focus Mode. The timer runs, notifications sleep, and you work. Just you and the task." },
          { n: '3', title: 'Learn', desc: "Finish and see the gap. Over time those gaps shrink — and your planning gets sharper every week." },
        ].map((s) => (
          <FadeSection key={s.n}>
            <li className="lp-how-step">
              <div className="lp-how-number" aria-hidden="true">{s.n}</div>
              <p className="lp-how-step-title">{s.title}</p>
              <p className="lp-how-step-desc">{s.desc}</p>
            </li>
          </FadeSection>
        ))}
      </ol>
    </section>

    {/* ── Final CTA ── */}
    <section className="lp-cta-banner" aria-labelledby="cta-heading">
      <div className="lp-cta-banner-inner">
        <h2 className="lp-cta-banner-title" id="cta-heading">Ready to close your gap?</h2>
        <p className="lp-cta-banner-sub">
          Join planners who already know where their time really goes.
        </p>
        <div className="lp-cta-banner-actions">
          <Link to="/register" className="lp-btn-banner-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">rocket_launch</span>
            Sign up free
          </Link>
          <Link to="/login" className="lp-btn-banner-ghost">Log in</Link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default LandingPage;
