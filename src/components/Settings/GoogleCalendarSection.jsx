import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCalendar } from '../../context/CalendarContext';
import { useLocale } from '../../i18n/LocaleContext';
import './GoogleCalendarSection.css';

const Spinner = () => <span className="set-spinner" aria-hidden="true" />;

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

export default function GoogleCalendarSection() {
  const { session, connectGoogleCalendar } = useAuth();
  const { calStatus, googleEmail, events, captureAndSync, syncEvents, disconnectCalendar } = useCalendar();
  const { t } = useLocale();
  const location = useLocation();
  const navigate  = useNavigate();

  const [errorMsg, setErrorMsg] = useState('');

  // Handle the ?gcal=connected OAuth callback when it lands on /settings
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('gcal') !== 'connected') return;

    // Clean URL immediately
    navigate('/settings', { replace: true });

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
    setErrorMsg('');
    const { error } = await connectGoogleCalendar('/settings');
    if (error) setErrorMsg(t('gcal.errConnect'));
  };

  const handleSyncNow = async () => {
    setErrorMsg('');
    const { error } = await syncEvents();
    if (error) setErrorMsg(t(error === 'expired' ? 'gcal.errExpired' : 'gcal.errSync'));
  };

  const isConnected = calStatus === 'connected' || calStatus === 'syncing';

  return (
    <div className="surface-card set-section">
      <h3 className="set-section-title">
        <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
        {t('gcal.title')}
      </h3>

      <div className="set-rows">

        {/* Connection status */}
        <div className="set-row">
          <div className="set-row-text">
            <span className="set-row-label">{t('gcal.statusLabel')}</span>
            <span className="set-row-desc">{t('gcal.optionalNote')}</span>
          </div>
          <div className="set-row-control">
            {calStatus === 'syncing'  && <Spinner />}
            {isConnected              && <span className="chip chip-done">{t('gcal.connected')}</span>}
            {calStatus === 'expired'  && <span className="chip chip-pending">{t('gcal.expired')}</span>}
            {(calStatus === 'idle' || calStatus === 'error') && (
              <span className="chip chip-pending">{t('gcal.notConnected')}</span>
            )}
          </div>
        </div>

        {/* Connected Google account */}
        {(isConnected || calStatus === 'expired') && googleEmail && (
          <div className="set-row">
            <div className="set-row-text">
              <span className="set-row-label">{t('gcal.account')}</span>
            </div>
            <div className="set-row-control">
              <span className="gcal-email" title={googleEmail}>{googleEmail}</span>
            </div>
          </div>
        )}

        {/* Sync row */}
        {isConnected && (
          <div className="set-row">
            <div className="set-row-text">
              <span className="set-row-label">{t('gcal.syncLabel')}</span>
              <span className="set-row-desc">{t('gcal.syncDesc')}</span>
            </div>
            <div className="set-row-control">
              <button
                className="set-action-btn"
                onClick={handleSyncNow}
                disabled={calStatus === 'syncing'}
                aria-busy={calStatus === 'syncing'}
              >
                {calStatus === 'syncing'
                  ? <><Spinner />{t('gcal.syncing')}</>
                  : <><span className="material-symbols-outlined" aria-hidden="true">sync</span>{t('gcal.syncNow')}</>
                }
              </button>
            </div>
          </div>
        )}

        {/* Connect / Reconnect / Disconnect */}
        <div className="set-row">
          <div className="set-row-text">
            {calStatus === 'idle' && (
              <span className="set-row-label">{t('gcal.connectDesc')}</span>
            )}
            {calStatus === 'expired' && (
              <span className="set-row-label">{t('gcal.expiredDesc')}</span>
            )}
          </div>
          <div className="set-row-control">
            {calStatus === 'idle' && (
              <button className="set-action-btn" onClick={handleConnect}>
                <span className="material-symbols-outlined" aria-hidden="true">add_link</span>
                {t('gcal.connect')}
              </button>
            )}
            {calStatus === 'expired' && (
              <button className="set-action-btn" onClick={handleConnect}>
                <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
                {t('gcal.reconnect')}
              </button>
            )}
            {isConnected && (
              <button className="set-action-btn set-signout-btn" onClick={disconnectCalendar}>
                <span className="material-symbols-outlined" aria-hidden="true">link_off</span>
                {t('gcal.disconnect')}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Error */}
      {errorMsg && (
        <p className="gcal-error" role="alert">
          <span className="material-symbols-outlined" aria-hidden="true">error</span>
          {errorMsg}
        </p>
      )}

      {/* Events preview */}
      {calStatus === 'connected' && events !== null && (
        <div className="gcal-events">
          <p className="gcal-events-heading">
            <span className="material-symbols-outlined" aria-hidden="true">event</span>
            {events.length === 0
              ? t('gcal.noEvents')
              : t('gcal.upcomingEvents', { count: String(Math.min(events.length, 5)) })}
          </p>
          {events.length > 0 && (
            <ul className="gcal-event-list">
              {events.slice(0, 5).map((ev, i) => (
                <li key={ev.id ?? i} className="gcal-event-item">
                  <span className="gcal-event-dot" aria-hidden="true" />
                  <div>
                    <p className="gcal-event-name">{ev.summary || t('gcal.noTitle')}</p>
                    <p className="gcal-event-time">{formatEventTime(ev)}</p>
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
