import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo/Logo';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import Footer from '../../components/Footer/Footer';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';
import { useLocale } from '../../i18n/LocaleContext';
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
  const { t } = useLocale();

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
        <Logo to="/" />

        <nav className="lp-nav-links" aria-label="Site navigation">
          <a href="#features" className="lp-nav-link">{t('landing.nav.features')}</a>
          <a href="#how" className="lp-nav-link">{t('landing.nav.howItWorks')}</a>
        </nav>

        <div className="lp-nav-actions">
          <Link to="/login" className="lp-btn-login">{t('landing.nav.logIn')}</Link>
          <Link to="/register" className="lp-btn-primary">{t('landing.nav.signUpFree')}</Link>
          <div className="lp-nav-divider" aria-hidden="true" />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

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

      <div
        id="lp-mobile-menu"
        className={`lp-nav-mobile-menu${open ? ' open' : ''}`}
        aria-hidden={!open}
      >
        <a href="#features" className="lp-nav-mobile-link" onClick={() => setOpen(false)}>{t('landing.nav.features')}</a>
        <a href="#how" className="lp-nav-mobile-link" onClick={() => setOpen(false)}>{t('landing.nav.howItWorks')}</a>
        <div className="lp-nav-mobile-divider" />
        <div className="lp-nav-mobile-actions">
          <Link to="/login" className="lp-btn-login" style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }} onClick={() => setOpen(false)}>{t('landing.nav.logIn')}</Link>
          <Link to="/register" className="lp-btn-primary" style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }} onClick={() => setOpen(false)}>{t('landing.nav.signUpFree')}</Link>
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
const LandingPage = () => {
  const { t } = useLocale();

  const FEATURES = [
    { icon: 'touch_app',   title: t('landing.features.f1title'), desc: t('landing.features.f1desc') },
    { icon: 'edit_note',   title: t('landing.features.f2title'), desc: t('landing.features.f2desc') },
    { icon: 'timer',       title: t('landing.features.f3title'), desc: t('landing.features.f3desc') },
    { icon: 'query_stats', title: t('landing.features.f4title'), desc: t('landing.features.f4desc') },
  ];

  const HOW_STEPS = [
    { n: '1', title: t('landing.howItWorks.s1title'), desc: t('landing.howItWorks.s1desc') },
    { n: '2', title: t('landing.howItWorks.s2title'), desc: t('landing.howItWorks.s2desc') },
    { n: '3', title: t('landing.howItWorks.s3title'), desc: t('landing.howItWorks.s3desc') },
  ];

  return (
    <div className="lp-wrapper">
      <MarketingNav />

      {/* ── Hero ── */}
      <section className="lp-hero" aria-labelledby="hero-headline">
        <div className="lp-hero-inner">
          <div className="lp-hero-left">
            <span className="lp-eyebrow" aria-hidden="true">
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>bolt</span>
              {t('landing.hero.eyebrow')}
            </span>
            <h1 className="lp-headline" id="hero-headline">
              {t('landing.hero.headline1')}{' '}
              <span className="gradient-text">{t('landing.hero.headline2')}</span>
            </h1>
            <p className="lp-subhead">{t('landing.hero.subheading')}</p>
            <div className="lp-cta-row">
              <Link to="/register" className="lp-btn-hero-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">rocket_launch</span>
                {t('landing.hero.ctaPrimary')}
              </Link>
              <Link to="/login" className="lp-btn-hero-secondary">
                {t('landing.hero.ctaSecondary')}
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
            <span className="lp-eyebrow">{t('landing.problem.eyebrow')}</span>
            <h2 className="lp-headline" id="problem-heading" style={{ textAlign: 'center', maxWidth: '520px' }}>
              {t('landing.problem.heading')}
            </h2>
          </div>
        </FadeSection>
        <div className="lp-problem-grid">
          <FadeSection>
            <div className="lp-problem-card">
              <div className="lp-problem-emoji" aria-hidden="true">😅</div>
              <p className="lp-problem-quote">{t('landing.problem.card1Quote')}</p>
              <p className="lp-problem-sub">{t('landing.problem.card1Sub')}</p>
            </div>
          </FadeSection>
          <FadeSection>
            <div className="lp-problem-card">
              <div className="lp-problem-emoji" aria-hidden="true">⏳</div>
              <p className="lp-problem-quote">{t('landing.problem.card2Quote')}</p>
              <p className="lp-problem-sub">{t('landing.problem.card2Sub')}</p>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="lp-section lp-features-section" aria-labelledby="features-heading">
        <FadeSection>
          <div className="lp-section-header">
            <span className="lp-eyebrow">{t('landing.features.eyebrow')}</span>
            <h2 className="lp-headline" id="features-heading" style={{ textAlign: 'center' }}>
              {t('landing.features.heading')}
            </h2>
          </div>
        </FadeSection>
        <div className="lp-features-grid">
          {FEATURES.map((f) => (
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
            <span className="lp-eyebrow">{t('landing.howItWorks.eyebrow')}</span>
            <h2 className="lp-headline" id="how-heading" style={{ textAlign: 'center' }}>
              {t('landing.howItWorks.heading')}
            </h2>
          </div>
        </FadeSection>
        <ol className="lp-how-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {HOW_STEPS.map((s) => (
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
          <h2 className="lp-cta-banner-title" id="cta-heading">{t('landing.cta.heading')}</h2>
          <p className="lp-cta-banner-sub">{t('landing.cta.subheading')}</p>
          <div className="lp-cta-banner-actions">
            <Link to="/register" className="lp-btn-banner-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">rocket_launch</span>
              {t('landing.cta.primary')}
            </Link>
            <Link to="/login" className="lp-btn-banner-ghost">{t('landing.cta.secondary')}</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
