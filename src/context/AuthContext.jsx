import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

/*
 * AuthContext — wraps Supabase Auth.
 *
 * Exposed values:
 *   session   — the raw Supabase Session object (null when logged out)
 *   user      — Supabase User object (null when logged out)
 *   loading   — true while the initial session check is in flight
 *   signUp    — create account; pass { email, password, firstName, lastName, username, phone }
 *   signIn    — email + password login; returns { error }
 *   signOut   — clears session
 *   resetPassword — sends a password-reset email; returns { error }
 *
 * ProtectedRoute should gate on `!loading && !session`.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Keep session in sync across tabs / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async ({ email, password, firstName, lastName, username, phone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name:  lastName,
          username,
          phone: phone || null,
        },
      },
    });
    return { data, error };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { data, error };
  }, []);

  /**
   * Starts the Google Calendar OAuth flow.
   * @param {string} redirectPath  The app path to return to after Google approves
   *   (e.g. '/settings' or '/schedule').
   *
   * This is entirely separate from signInWithGoogle (login).
   * It requests calendar.readonly scope on top of the user's existing session.
   */
  const connectGoogleCalendar = useCallback(async (redirectPath = '/settings') => {
    // Set a flag BEFORE the redirect so CalendarContext's onAuthStateChange
    // listener can distinguish this SIGNED_IN event from a normal Google login.
    // sessionStorage survives the OAuth round-trip within the same tab.
    // Note: redirectTo must NOT include query params — Supabase strips them before
    // redirecting back, so the flag is the only reliable cross-redirect signal.
    sessionStorage.setItem('gcal_pending', redirectPath);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'email profile https://www.googleapis.com/auth/calendar.readonly',
        redirectTo: `${window.location.origin}${redirectPath}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });

    if (error) sessionStorage.removeItem('gcal_pending');
    return { data, error };
  }, []);

  const user = session?.user ?? null;

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signOut, resetPassword, signInWithGoogle, connectGoogleCalendar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
