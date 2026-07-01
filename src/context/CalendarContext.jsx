import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchUpcomingEvents } from '../services/calendarService';

const CalendarContext = createContext(null);

export function CalendarProvider({ children }) {
  // calStatus: 'idle' | 'syncing' | 'connected' | 'expired' | 'error'
  const [calStatus,   setCalStatus]   = useState('idle');
  const [calToken,    setCalToken]    = useState(null);   // Google access token, in-memory only
  const [googleEmail, setGoogleEmail] = useState('');
  const [events,      setEvents]      = useState(null);

  /**
   * Call this immediately after the OAuth callback returns.
   * Stores the token in state and fetches events in one step
   * to avoid the async state-update race when calling both separately.
   */
  const captureAndSync = useCallback(async (token, email) => {
    setCalToken(token);
    setGoogleEmail(email || '');
    setCalStatus('syncing');

    const { data, error } = await fetchUpcomingEvents(token);

    if (error === 'expired') {
      setCalToken(null);
      setCalStatus('expired');
      return { error };
    }
    if (error) {
      setCalStatus('idle');
      return { error };
    }

    setEvents(data);
    setCalStatus('connected');
    return { error: null };
  }, []);

  /** Re-fetch events with the token already in state (Sync Now button). */
  const syncEvents = useCallback(async () => {
    if (!calToken) { setCalStatus('idle'); return { error: 'no_token' }; }
    setCalStatus('syncing');

    const { data, error } = await fetchUpcomingEvents(calToken);

    if (error === 'expired') {
      setCalToken(null);
      setCalStatus('expired');
      return { error };
    }
    if (error) {
      setCalStatus('connected');
      return { error };
    }

    setEvents(data);
    setCalStatus('connected');
    return { error: null };
  }, [calToken]);

  /** Clears all calendar state — equivalent to "disconnect". */
  const disconnectCalendar = useCallback(() => {
    setCalToken(null);
    setGoogleEmail('');
    setEvents(null);
    setCalStatus('idle');
  }, []);

  return (
    <CalendarContext.Provider value={{
      calStatus,
      googleEmail,
      events,
      captureAndSync,
      syncEvents,
      disconnectCalendar,
    }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendar must be used inside <CalendarProvider>');
  return ctx;
}
