import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useLocale } from '../../i18n/LocaleContext';
import './Premium.css';

const FEATURES = [
  { icon: 'query_stats',    label: 'AI Gap insights',         free: false, pro: true },
  { icon: 'bar_chart',      label: 'Advanced analytics',      free: false, pro: true },
  { icon: 'calendar_month', label: 'Google Calendar sync',    free: false, pro: true },
  { icon: 'group',          label: 'Team workspaces',         free: false, pro: true },
  { icon: 'export_notes',   label: 'CSV / JSON export',       free: false, pro: true },
  { icon: 'priority_high',  label: 'Priority support',        free: false, pro: true },
  { icon: 'check_circle',   label: 'Unlimited tasks',         free: true,  pro: true },
  { icon: 'timer',          label: 'Focus Mode',              free: true,  pro: true },
  { icon: 'insights',       label: 'Basic statistics',        free: true,  pro: true },
  { icon: 'history',        label: 'Task history',            free: true,  pro: true },
  { icon: 'schedule',       label: 'Schedule view',           free: true,  pro: true },
  { icon: 'dark_mode',      label: 'Dark / light theme',      free: true,  pro: true },
];

const TESTIMONIALS = [
  { name: 'Lior B.', role: 'Product Manager', quote: 'The Gap insights showed me I was consistently underestimating design reviews. Cut my overruns by 40% in a month.' },
  { name: 'Noa S.',  role: 'Senior Engineer', quote: 'Calendar sync is a game-changer. My tasks live where my meetings are.' },
  { name: 'Itay K.', role: 'Freelance Designer', quote: 'Worth every shekel. I now quote clients based on actual data, not gut feeling.' },
];

const CheckIcon = ({ on }) => (
  on
    ? <span className="prem-check yes" aria-label="Included"><span className="material-symbols-outlined">check</span></span>
    : <span className="prem-check no"  aria-label="Not included"><span className="material-symbols-outlined">close</span></span>
);

const Premium = () => {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [billing, setBilling] = useState('monthly'); // monthly | yearly
  const monthlyPrice = 9;
  const yearlyPrice  = Math.round(monthlyPrice * 12 * 0.75);
  const displayPrice = billing === 'yearly' ? (yearlyPrice / 12).toFixed(0) : monthlyPrice;

  const [clicked, setClicked] = useState(false);

  return (
    <div className="prem-layout">
      <Navbar />
      <main id="main-content" className="prem-main">

        {/* Back to Settings */}
        <div className="prem-back-wrap">
          <button className="prem-back-btn" onClick={() => navigate('/settings')}>
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            {t('premium.backToSettings')}
          </button>
        </div>

        {/* Hero */}
        <div className="prem-hero">
          <div className="prem-badge">
            <span className="material-symbols-outlined" aria-hidden="true">bolt</span>
            StartSmart Pro
          </div>
          <h1 className="prem-title">Plan smarter.<br />Grow faster.</h1>
          <p className="prem-subtitle">
            Unlock AI-powered insights, calendar sync, and team features — everything you need to master the Gap.
          </p>

          {/* Billing toggle */}
          <div className="prem-billing-toggle" role="group" aria-label="Billing period">
            <button
              className={`prem-billing-btn${billing === 'monthly' ? ' active' : ''}`}
              onClick={() => setBilling('monthly')}
              aria-pressed={billing === 'monthly'}
            >
              Monthly
            </button>
            <button
              className={`prem-billing-btn${billing === 'yearly' ? ' active' : ''}`}
              onClick={() => setBilling('yearly')}
              aria-pressed={billing === 'yearly'}
            >
              Yearly
              <span className="prem-save-chip">Save 25%</span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="prem-cards">

          {/* Free */}
          <div className="prem-card">
            <div className="prem-card-head">
              <span className="prem-plan-name">Free</span>
              <div className="prem-price-row">
                <span className="prem-price">$0</span>
                <span className="prem-price-period">/ month</span>
              </div>
              <p className="prem-plan-desc">Everything you need to get started with gap-aware planning.</p>
            </div>
            <Link to="/register" className="prem-cta-btn secondary">Get started free</Link>
            <ul className="prem-feature-list">
              {FEATURES.filter((f) => f.free).map((f) => (
                <li key={f.label} className="prem-feature-item">
                  <span className="material-symbols-outlined prem-feat-icon" aria-hidden="true">{f.icon}</span>
                  {f.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="prem-card pro">
            <div className="prem-card-badge">Most popular</div>
            <div className="prem-card-head">
              <span className="prem-plan-name">Pro</span>
              <div className="prem-price-row">
                <span className="prem-price">${displayPrice}</span>
                <span className="prem-price-period">/ month</span>
              </div>
              {billing === 'yearly' && (
                <span className="prem-billed-note">Billed ${yearlyPrice}/year</span>
              )}
              <p className="prem-plan-desc">AI insights, team features, and integrations for serious planners.</p>
            </div>
            <button
              className="prem-cta-btn primary"
              onClick={() => setClicked(true)}
              disabled={clicked}
            >
              {clicked ? (
                <>
                  <span className="material-symbols-outlined" aria-hidden="true">check</span>
                  You&apos;re on the list!
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" aria-hidden="true">bolt</span>
                  Start Pro — ${displayPrice}/mo
                </>
              )}
            </button>
            <ul className="prem-feature-list">
              {FEATURES.map((f) => (
                <li key={f.label} className={`prem-feature-item${!f.free ? ' highlight' : ''}`}>
                  <span className="material-symbols-outlined prem-feat-icon" aria-hidden="true">{f.icon}</span>
                  {f.label}
                  {!f.free && <span className="prem-new-chip">Pro</span>}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Comparison table */}
        <section className="prem-table-section">
          <h2 className="prem-section-title">Full feature comparison</h2>
          <div className="prem-table-wrap">
            <table className="prem-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free</th>
                  <th>Pro</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr key={f.label}>
                    <td>
                      <span className="prem-table-feat">
                        <span className="material-symbols-outlined" aria-hidden="true">{f.icon}</span>
                        {f.label}
                      </span>
                    </td>
                    <td><CheckIcon on={f.free} /></td>
                    <td><CheckIcon on={f.pro} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Testimonials */}
        <section className="prem-testimonials">
          <h2 className="prem-section-title">Loved by planners</h2>
          <div className="prem-test-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="prem-test-card">
                <p className="prem-test-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="prem-test-author">
                  <div className="prem-test-avatar">{t.name[0]}</div>
                  <div>
                    <div className="prem-test-name">{t.name}</div>
                    <div className="prem-test-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="prem-faq">
          <h2 className="prem-section-title">Common questions</h2>
          <div className="prem-faq-grid">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel from Settings at any time. You keep Pro access until the end of your billing period.' },
              { q: 'Is there a free trial?', a: 'Pro features are in beta. Sign up for the waitlist and you\'ll get 30 days free when we launch.' },
              { q: 'What payment methods?', a: 'We accept all major credit cards, PayPal, and Apple/Google Pay.' },
              { q: 'What about teams?', a: 'Team workspaces are included in Pro. Invite teammates and share insights across your organisation.' },
            ].map(({ q, a }) => (
              <div key={q} className="prem-faq-item">
                <h3 className="prem-faq-q">{q}</h3>
                <p className="prem-faq-a">{a}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Premium;
