import React, { createContext, useContext, useState } from 'react';

const PROFILE_KEY = 'ss_profile_v1';

const DEFAULT_PROFILE = {
  firstName: 'Maya',
  lastName:  'Cohen',
  username:  'maya_c',
  email:     'maya@example.com',
  phone:     '',
  bio:       '',
};

const load = () => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? { ...DEFAULT_PROFILE, ...JSON.parse(stored) } : DEFAULT_PROFILE;
  } catch { return DEFAULT_PROFILE; }
};

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const [profile,   setProfileState] = useState(load);
  // avatarSrc is kept in memory only — large base64 doesn't belong in localStorage.
  // Backend integration point: swap for a URL returned by the upload API.
  const [avatarSrc, setAvatarSrc]    = useState(null);

  const setProfile = (updates) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem(PROFILE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, avatarSrc, setAvatarSrc }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be inside ProfileProvider');
  return ctx;
};
