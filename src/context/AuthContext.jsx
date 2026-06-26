import React, { createContext, useContext, useState, useCallback } from 'react';

/*
 * AuthContext — token + user state with localStorage persistence.
 *
 * Storage keys:
 *   ss_auth_token  — raw JWT / session token string
 *   ss_auth_user   — JSON-serialised user object { id, name, email, ... }
 *
 * These keys are read on first mount so the session survives a page refresh.
 * They are cleared on logout or when the backend returns 401.
 */

const AuthContext = createContext(null);

function readStorage() {
  try {
    const token = localStorage.getItem('ss_auth_token') ?? null;
    const raw   = localStorage.getItem('ss_auth_user');
    const user  = raw ? JSON.parse(raw) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStorage);

  const login = useCallback((token, user) => {
    localStorage.setItem('ss_auth_token', token);
    localStorage.setItem('ss_auth_user', JSON.stringify(user));
    setAuth({ token, user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ss_auth_token');
    localStorage.removeItem('ss_auth_user');
    setAuth({ token: null, user: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
