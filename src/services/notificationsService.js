import { supabase } from '../lib/supabaseClient';

const TYPE_ICON = {
  reminder:  'event',
  time_gap:  'query_stats',
  system:    'notifications',
};

// Maps known English notification titles to i18n keys.
// Bodies with {taskTitle} extract the quoted task name from the stored message.
// Lookup is case-insensitive and trims whitespace so minor DB variants still match.
const NOTIF_KEY_MAP_RAW = {
  'task due soon':          { titleKey: 'notif.tpl.taskDue.title',      bodyKey: 'notif.tpl.taskDue.body',      hasParam: true },
  'task due today':         { titleKey: 'notif.tpl.taskDue.title',      bodyKey: 'notif.tpl.taskDue.body',      hasParam: true },
  'time gap detected':      { titleKey: 'notif.tpl.timeGap.title',      bodyKey: 'notif.tpl.timeGap.body',      hasParam: true },
  'weekly goal progress':   { titleKey: 'notif.tpl.weeklyGoal.title',   bodyKey: 'notif.tpl.weeklyGoal.body',   hasParam: false },
  // welcome variants (DB trigger may omit the "!" or use slightly different wording)
  'welcome to startsmart!': { titleKey: 'notif.tpl.welcome.title',      bodyKey: 'notif.tpl.welcome.body',      hasParam: false },
  'welcome to startsmart':  { titleKey: 'notif.tpl.welcome.title',      bodyKey: 'notif.tpl.welcome.body',      hasParam: false },
  'welcome!':               { titleKey: 'notif.tpl.welcome.title',      bodyKey: 'notif.tpl.welcome.body',      hasParam: false },
  'welcome':                { titleKey: 'notif.tpl.welcome.title',      bodyKey: 'notif.tpl.welcome.body',      hasParam: false },
  'focus session complete':  { titleKey: 'notif.tpl.focusDone.title',   bodyKey: 'notif.tpl.focusDone.body',   hasParam: false },
  'focus session completed': { titleKey: 'notif.tpl.focusDone.title',   bodyKey: 'notif.tpl.focusDone.body',   hasParam: false },
  'daily summary':           { titleKey: 'notif.tpl.dailySummary.title', bodyKey: 'notif.tpl.dailySummary.body', hasParam: false },
  'new feature: insights':   { titleKey: 'notif.tpl.newInsights.title', bodyKey: 'notif.tpl.newInsights.body', hasParam: false },
  'new feature - insights':  { titleKey: 'notif.tpl.newInsights.title', bodyKey: 'notif.tpl.newInsights.body', hasParam: false },
  'excellent estimation!':   { titleKey: 'notif.tpl.excellentEst.title', bodyKey: 'notif.tpl.excellentEst.body', hasParam: false },
  'excellent estimation':    { titleKey: 'notif.tpl.excellentEst.title', bodyKey: 'notif.tpl.excellentEst.body', hasParam: false },
  'unstarted task':          { titleKey: 'notif.tpl.unstarted.title',   bodyKey: 'notif.tpl.unstarted.body',   hasParam: true },
  'unstarted task reminder': { titleKey: 'notif.tpl.unstarted.title',   bodyKey: 'notif.tpl.unstarted.body',   hasParam: true },
  'weekly report ready':     { titleKey: 'notif.tpl.weeklyReport.title', bodyKey: 'notif.tpl.weeklyReport.body', hasParam: false },
  'streak milestone':        { titleKey: 'notif.tpl.streak.title',      bodyKey: 'notif.tpl.streak.body',      hasParam: false },
  'long session detected':   { titleKey: 'notif.tpl.longSession.title', bodyKey: 'notif.tpl.longSession.body', hasParam: false },
};

const lookupNotifKey = (title) =>
  title ? NOTIF_KEY_MAP_RAW[title.trim().toLowerCase()] : undefined;

function extractTaskTitle(message) {
  const match = message?.match(/"([^"]+)"/);
  return match ? match[1] : undefined;
}

function fromDB(row) {
  // Key-based notifications: title IS the i18n key (e.g. 'notif.tpl.taskDue.title').
  // message holds the dynamic task name (or is empty for param-less templates).
  // No string matching required — the client calls t(titleKey) directly.
  if (row.title?.startsWith('notif.')) {
    const titleKey = row.title;
    const bodyKey  = row.title.replace('.title', '.body');
    return {
      id:        row.id,
      icon:      TYPE_ICON[row.type] ?? 'notifications',
      title:     row.title,
      body:      row.message || '',
      titleKey,
      bodyKey,
      taskTitle: row.message || undefined,
      createdAt: row.created_at,
      read:      row.is_read,
    };
  }

  // Legacy: title is English text — look up the i18n key by string matching.
  // Used for notifications seeded before the key-based format was introduced.
  const tpl = lookupNotifKey(row.title);
  return {
    id:        row.id,
    icon:      TYPE_ICON[row.type] ?? 'notifications',
    title:     row.title,
    body:      row.message,
    titleKey:  tpl?.titleKey,
    bodyKey:   tpl?.bodyKey,
    taskTitle: tpl?.hasParam ? extractTaskTitle(row.message) : undefined,
    createdAt: row.created_at,
    read:      row.is_read,
  };
}

export async function listNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromDB);
}

export async function markNotificationRead(id) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
}
