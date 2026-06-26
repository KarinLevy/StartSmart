import { supabase } from '../lib/supabaseClient';

const SETTINGS_LS_KEY = 'ss_settings_v1';

/** Shape mirrors the DEFAULT_SETTINGS in Settings.jsx */
const DEFAULTS = {
  notifs: {
    taskReminders: true,
    timeGapAlerts: true,
    weeklySummary: false,
    soundEffects:  true,
    focusEndAlert: true,
  },
  focus: {
    autoStartBreak: false,
    showGapLive:    true,
    confirmFinish:  true,
  },
  privacy: {
    publicProfile: false,
    shareStats:    false,
  },
  goal:       '4',
  defaultEst: '30',
};

function toDBShape(settings) {
  return {
    focus:                    settings.focus   ?? DEFAULTS.focus,
    notifications:            settings.notifs  ?? DEFAULTS.notifs,
    privacy:                  settings.privacy ?? DEFAULTS.privacy,
    daily_goal_hours:         parseInt(settings.goal       ?? '4',  10),
    default_estimate_minutes: parseInt(settings.defaultEst ?? '30', 10),
  };
}

function fromDBShape(row) {
  return {
    notifs:     row.notifications            ?? DEFAULTS.notifs,
    focus:      row.focus                    ?? DEFAULTS.focus,
    privacy:    row.privacy                  ?? DEFAULTS.privacy,
    goal:       String(row.daily_goal_hours         ?? 4),
    defaultEst: String(row.default_estimate_minutes ?? 30),
  };
}

/**
 * Load settings for the current user.
 * Priority: Supabase DB → localStorage fallback → hardcoded defaults.
 */
export async function loadUserSettings() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    // Not logged in — return localStorage or defaults
    try {
      const raw = localStorage.getItem(SETTINGS_LS_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch { return { ...DEFAULTS }; }
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error || !data) {
    // Row missing (shouldn't happen after migration, but be safe)
    try {
      const raw = localStorage.getItem(SETTINGS_LS_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch { return { ...DEFAULTS }; }
  }

  return fromDBShape(data);
}

/**
 * Save full settings object for the current user.
 * Writes to both Supabase and localStorage (localStorage acts as an
 * instant-read cache so the UI doesn't wait for a round-trip on mount).
 */
export async function saveUserSettings(settings) {
  try { localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify(settings)); } catch {}

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  await supabase
    .from('user_settings')
    .upsert(
      { user_id: session.user.id, ...toDBShape(settings) },
      { onConflict: 'user_id' }
    );
}
