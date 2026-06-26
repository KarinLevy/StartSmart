import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const ProfileContext = createContext(null);

const DEFAULT_PROFILE = {
  firstName: '',
  lastName:  '',
  username:  '',
  email:     '',
  phone:     '',
  bio:       '',
};

export const ProfileProvider = ({ children }) => {
  const [profile,   setProfileState] = useState(DEFAULT_PROFILE);
  const [avatarSrc, setAvatarSrc]    = useState(null);

  // Load profile from Supabase when the auth session is available
  useEffect(() => {
    const load = async (userId, email) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, username, phone, profile_image, notifications_enabled')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfileState({
          firstName:            data.first_name           ?? '',
          lastName:             data.last_name            ?? '',
          username:             data.username             ?? '',
          email:                email                     ?? '',
          phone:                data.phone                ?? '',
          bio:                  '',
          notificationsEnabled: data.notifications_enabled ?? true,
        });
        if (data.profile_image) setAvatarSrc(data.profile_image);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) load(session.user.id, session.user.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        load(session.user.id, session.user.email);
      } else {
        setProfileState(DEFAULT_PROFILE);
        setAvatarSrc(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setProfile = (updates) => {
    setProfileState((prev) => ({ ...prev, ...updates }));
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
