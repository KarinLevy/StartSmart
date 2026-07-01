import { supabase } from '../lib/supabaseClient';

// ── Mappers ───────────────────────────────────────────────────────────────────

/**
 * Normalize a scheduled_date value coming from the DB.
 * The column may be a timestamp type, which causes the DB to append T00:00:00
 * to date-only saves. We detect midnight and strip the time so those tasks
 * are treated as "unscheduled" rather than appearing at 00:00 on the timeline.
 * Non-midnight times are kept as YYYY-MM-DDTHH:MM.
 */
function normalizeScheduledDate(raw) {
  if (!raw) return '';
  // Remove fractional seconds and timezone suffix (Z or ±HH:MM)
  const s = raw.replace(/(\.\d+)?(Z|[+-]\d{2}:\d{2})$/, '');
  if (!s.includes('T')) return s;           // already date-only
  const timePart = s.slice(11);             // "HH:MM:SS" or "HH:MM"
  if (timePart === '00:00:00' || timePart === '00:00') return s.slice(0, 10);
  return s.slice(0, 16);                    // keep YYYY-MM-DDTHH:MM
}

/** DB row → app shape (camelCase) */
function fromDB(row) {
  // Use the most recent time_log for actualMinutes / gap
  const logs = row.time_logs ?? [];
  const latestLog = logs.length > 0
    ? logs.reduce((a, b) => (new Date(a.created_at) > new Date(b.created_at) ? a : b))
    : null;

  return {
    id:               row.id,
    title:            row.title,
    description:      row.description   ?? '',
    estimatedMinutes: row.estimated_duration ?? 0,
    scheduledDate:    normalizeScheduledDate(row.scheduled_date),
    status:           row.task_status,
    priorityHigh:     row.priority_high ?? false,
    actualMinutes:    latestLog?.actual_duration ?? null,
    gap:              latestLog?.gap             ?? null,
    completedAt:      row.completed_at  ?? null,
    archivedAt:       row.archived_at   ?? null,
    reflection:       row.reflection    ?? '',
    tags: (row.task_tags ?? []).map((jt) => ({
      name:  jt.tags?.tag_name ?? '',
      color: jt.tags?.color    ?? '#6b7280',
    })),
  };
}

/** App shape → DB columns for INSERT/UPDATE */
function toDB(data) {
  const out = {};
  if (data.title            !== undefined) out.title              = data.title;
  if (data.description      !== undefined) out.description        = data.description;
  if (data.estimatedMinutes !== undefined) out.estimated_duration = data.estimatedMinutes;
  if (data.scheduledDate    !== undefined) out.scheduled_date     = data.scheduledDate || null;
  if (data.status           !== undefined) out.task_status        = data.status;
  if (data.priorityHigh     !== undefined) out.priority_high      = data.priorityHigh;
  if (data.reflection       !== undefined) out.reflection         = data.reflection || null;
  if (data.archivedAt       !== undefined) out.archived_at        = data.archivedAt  || null;
  return out;
}

// ── Tag helpers ───────────────────────────────────────────────────────────────

/**
 * Upsert tags for a task:
 *   1. For each tag, upsert into `tags` (user_id + tag_name unique) → get id
 *   2. Delete all existing task_tags for this task
 *   3. Insert fresh task_tags rows
 */
async function syncTags(taskId, userId, tags) {
  if (!tags || tags.length === 0) {
    // Remove all tags for this task
    await supabase.from('task_tags').delete().eq('task_id', taskId);
    return;
  }

  // Upsert each tag by (user_id, tag_name) — unique constraint now enforced by DB
  const tagIds = [];
  for (const tag of tags) {
    const { data, error } = await supabase
      .from('tags')
      .upsert(
        { user_id: userId, tag_name: tag.name, color: tag.color },
        { onConflict: 'user_id,tag_name', ignoreDuplicates: false }
      )
      .select('id')
      .single();
    if (!error && data) tagIds.push(data.id);
  }

  // Replace task_tags
  await supabase.from('task_tags').delete().eq('task_id', taskId);
  if (tagIds.length > 0) {
    await supabase.from('task_tags').insert(
      tagIds.map((tagId) => ({ task_id: taskId, tag_id: tagId }))
    );
  }
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * List all tasks for the current user, newest first, with tags joined.
 */
export async function listTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      task_tags ( tags ( id, tag_name, color ) ),
      time_logs ( actual_duration, gap, created_at )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(fromDB);
}

/**
 * Fetch a single task by id (with tags).
 */
export async function getTaskById(id) {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      task_tags ( tags ( id, tag_name, color ) ),
      time_logs ( actual_duration, gap, created_at )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return fromDB(data);
}

/**
 * Create a task (and sync its tags).
 * Returns the new task in app shape.
 */
export async function createTask(userId, taskData) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...toDB(taskData), user_id: userId, task_status: 'pending' })
    .select()
    .single();

  if (error) throw error;

  await syncTags(data.id, userId, taskData.tags ?? []);

  // Re-fetch with tags joined
  return getTaskById(data.id);
}

/**
 * Update a task's fields (and optionally its tags).
 */
export async function updateTask(id, userId, updates) {
  const dbUpdates = toDB(updates);

  if (Object.keys(dbUpdates).length > 0) {
    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id);
    if (error) throw error;
  }

  if (updates.tags !== undefined) {
    await syncTags(id, userId, updates.tags);
  }

  return getTaskById(id);
}

/**
 * Soft-delete a task by setting deleted_at = now().
 * Cascaded child rows (time_logs, break_logs, task_tags) are preserved
 * and simply disappear from the UI once the task is filtered out.
 * Hard-delete (via DB trigger or admin function) can be added later.
 */
export async function deleteTask(id) {
  const { error } = await supabase
    .from('tasks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
