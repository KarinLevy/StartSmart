import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCalendar } from '../../context/CalendarContext';
import { useLocale } from '../../i18n/LocaleContext';
import './GoogleCalendarCard.css';

const Spinner = () => (
  <span
    className="material-symbols-outlined gcal-card-spinner"
    aria-hidden="true"
    style={{ animation: 'spin 1s linear infinite', fontSize: '1.125rem' }}
  >
    progress_activity
  </span>
);

function formatEventTime(event) {
  const dt   = event.start?.dateTime;
  const date = event.start?.date;
  const raw  = dt || date;
  if (!raw) return '';
  try {
    const d = new Date(raw);
    if (dt) {
      return d.toLocaleString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    }
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return raw;
  }
}

export default function GoogleCalendarCard() {
  const { session, connectGoogleCalendar } = useAuth();
  const { calStatus, googleEmail, events, captureAndSync, syncEvents, disconnectCalendar } = useCalendar();
  const { t } = useLocale();
  const location = useLocation();
  const navigate  = useNavigate();

  const [errorMsg,    setErrorMsg]    = useState('');
  const [connecting,  setConnecting]  = useState(false);

  // Handle the ?gcal=connected OAuth callback when it lands on /schedule
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('gcal') !== 'connected') return;

    navigate('/schedule', { replace: true });

    const providerToken = session?.provider_token;
    if (!providerToken) {
      setErrorMsg(t('gcal.errNoToken'));
      return;
    }

    captureAndSync(providerToken, session?.user?.email ?? '').then(({ error }) => {
      if (error) setErrorMsg(t(error === 'expired' ? 'gcal.errExpired' : 'gcal.errSync'));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = async () => {
    setConnecting(true);
    setErrorMsg('');
    const { error } = await connectGoogleCalendar('/schedule');
    if (error) {
      setErrorMsg(t('gcal.errConnect'));
      setConnecting(false);
    }
    // On success the browser redirects; no cleanup needed here
  };

  const handleSyncNow = async () => {
    setErrorMsg('');
    const { error } = await syncEvents();
    if (error) setErrorMsg(t(error === 'expired' ? 'gcal.errExpired' : 'gcal.errSync'));
  };

  const isConnected = calStatus === 'connected' || calStatus === 'syncing';
  const isBusy      = calStatus === 'syncing' || connecting;

  // ── Not connected ────────────────────────────────────────────────────────────
  if (!isConnected && calStatus !== 'expired') {
    return (
      <div className="gcal-card gcal-card--idle surface-card">
        <div className="gcal-card-icon-wrap" aria-hidden="true">
          <span className="material-symbols-outlined gcal-card-icon">calendar_month</span>
        </div>
        <div className="gcal-card-body">
          <p className="gcal-card-title">{t('gcal.card.connectTitle')}</p>
          <p className="gcal-card-desc">{t('gcal.card.connectDesc')}</p>
          {errorMsg && (
            <p className="gcal-card-error" role="alert">
              <span className="material-symbols-outlined" aria-hidden="true">error</span>
              {errorMsg}
            </p>
          )}
        </div>
        <button
          className="gcal-card-btn gcal-card-btn--primary"
          onClick={handleConnect}
          disabled={isBusy}
          aria-busy={isBusy}
        >
          {isBusy ? <Spinner /> : <span className="material-symbols-outlined" aria-hidden="true">add_link</span>}
          {isBusy ? t('gcal.connecting') : t('gcal.connect')}
        </button>
      </div>
    );
  }

  // ── Expired ──────────────────────────────────────────────────────────────────
  if (calStatus === 'expired') {
    return (
      <div className="gcal-card gcal-card--expired surface-card">
        <div className="gcal-card-icon-wrap" aria-hidden="true">
          <span className="material-symbols-outlined gcal-card-icon">calendar_month</span>
        </div>
        <div className="gcal-card-body">
          <p className="gcal-card-title">
            {t('gcal.title')}
            <span className="chip chip-pending gcal-card-badge">{t('gcal.expired')}</span>
          </p>
          <p className="gcal-card-desc">{t('gcal.expiredDesc')}</p>
        </div>
        <button
          className="gcal-card-btn gcal-card-btn--primary"
          onClick={handleConnect}
          disabled={isBusy}
          aria-busy={isBusy}
        >
          {isBusy ? <Spinner /> : <span className="material-symbols-outlined" aria-hidden="true">refresh</span>}
          {t('gcal.reconnect')}
        </button>
      </div>
    );
  }

  // ── Connected ────────────────────────────────────────────────────────────────
  return (
    <div className="gcal-card gcal-card--connected surface-card">
      {/* Header */}
      <div className="gcal-card-header">
        <div className="gcal-card-header-left">
          <span className="material-symbols-outlined gcal-card-icon-sm" aria-hidden="true">calendar_month</span>
          <div>
            <p className="gcal-card-title">
              {t('gcal.title')}
              <span className="chip chip-done gcal-card-badge">{t('gcal.connected')}</span>
            </p>
            {googleEmail && (
              <p className="gcal-card-account" title={googleEmail}>{googleEmail}</p>
            )}
          </div>
        </div>
        <div className="gcal-card-actions">
          <button
            className="gcal-card-btn gcal-card-btn--secondary"
            onClick={handleSyncNow}
            disabled={isBusy}
            aria-busy={isBusy}
            aria-label={t('gcal.syncNow')}
          >
            {calStatus === 'syncing'
              ? <Spinner />
              : <span className="material-symbols-outlined" aria-hidden="true">sync</span>}
            {calStatus === 'syncing' ? t('gcal.syncing') : t('gcal.syncNow')}
          </button>
          <Link to="/settings" className="gcal-card-btn gcal-card-btn--ghost">
            <span className="material-symbols-outlined" aria-hidden="true">settings</span>
            {t('gcal.card.manage')}
          </Link>
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <p className="gcal-card-error" role="alert">
          <span className="material-symbols-outlined" aria-hidden="true">error</span>
          {errorMsg}
        </p>
      )}

      {/* Events */}
      {events !== null && (
        <div className="gcal-card-events">
          {events.length === 0 ? (
            <p className="gcal-card-no-events">
              <span className="material-symbols-outlined" aria-hidden="true">event_busy</span>
              {t('gcal.noEvents')}
            </p>
          ) : (
            <ul className="gcal-card-event-list">
              {events.slice(0, 5).map((ev, i) => (
                <li key={ev.id ?? i} className="gcal-card-event-item">
                  <span className="gcal-card-event-dot" aria-hidden="true" />
                  <div className="gcal-card-event-body">
                    <p className="gcal-card-event-name">{ev.summary || t('gcal.noTitle')}</p>
                    <p className="gcal-card-event-time">{formatEventTime(ev)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
