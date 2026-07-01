import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { fetchUpcomingEvents } from '../services/calendarService';

const CalendarContext = createContext(null);

export function CalendarProvider({ children }) {
  // calStatus: 'idle' | 'syncing' | 'connected' | 'expired' | 'error'
  const [calStatus,   setCalStatus]   = useState('idle');
  const [calToken,    setCalToken]    = useState(null);   // Google access token, in-memory only
  const [googleEmail, setGoogleEmail] = useState('');
  const [events,      setEvents]      = useState(null);

  /**
   * Call this immediately after capturing a valid provider_token.
   * Stores the token in state and fetches events in one step to avoid
   * the async state-update race when calling both separately.
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
    if (error === 'forbidden') {
      setCalToken(null);
      setCalStatus('forbidden');
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
    if (error === 'forbidden') {
      setCalToken(null);
      setCalStatus('forbidden');
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

  /**
   * Listen for the SIGNED_IN event that Supabase fires after the Calendar
   * OAuth completes. This is the only reliable place to read provider_token —
   * the session object passed to onAuthStateChange has the fresh tokens,
   * whereas React component state is still stale at useEffect time.
   *
   * The sessionStorage flag ('gcal_pending') is set by connectGoogleCalendar()
   * before the OAuth redirect, distinguishing this SIGNED_IN from normal login.
   */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Handle both SIGNED_IN and INITIAL_SESSION: with implicit flow the hash
      // may be processed before this useEffect registers, so Supabase replays
      // the session as INITIAL_SESSION to the new subscriber instead of SIGNED_IN.
      if (event !== 'SIGNED_IN' && event !== 'INITIAL_SESSION') return;

      const pending = sessionStorage.getItem('gcal_pending');
      if (!pending) return;

      const providerToken = newSession?.provider_token;
      if (!providerToken) return;   // no calendar token — OAuth may have been for login only

      sessionStorage.removeItem('gcal_pending');
      captureAndSync(providerToken, newSession?.user?.email ?? '');
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
