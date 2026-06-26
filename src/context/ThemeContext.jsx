import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ss-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Seed theme from profile row on login
  useEffect(() => {
    const apply = async (userId) => {
      const { data } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', userId)
        .single();
      if (data?.theme) {
        setTheme(data.theme);
        localStorage.setItem('ss-theme', data.theme);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) apply(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) apply(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ss-theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // Write theme back to profiles row (best-effort, non-blocking)
  const setAndPersistTheme = async (newTheme) => {
    setTheme(newTheme);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      supabase.from('profiles').update({ theme: newTheme }).eq('id', session.user.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setAndPersistTheme(theme === 'light' ? 'dark' : 'light') }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
