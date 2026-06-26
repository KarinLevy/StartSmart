import { supabase } from '../lib/supabaseClient';

const TYPE_ICON = {
  reminder:  'event',
  time_gap:  'query_stats',
  system:    'notifications',
};

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)   return 'just now';
  if (min < 60)  return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24)   return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function fromDB(row) {
  return {
    id:    row.id,
    icon:  TYPE_ICON[row.type] ?? 'notifications',
    title: row.title,
    body:  row.message,
    time:  relativeTime(row.created_at),
    read:  row.is_read,
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
