import { supabase } from '../lib/supabaseClient';

/**
 * Insert a completed focus session into time_logs.
 * Returns the created row (with id) so break_logs can reference it.
 */
export async function insertTimeLog({
  taskId,
  userId,
  startedAt,
  endedAt,
  actualDuration,
  estimatedDuration,
  gap,
}) {
  const { data, error } = await supabase
    .from('time_logs')
    .insert({
      task_id:            taskId,
      user_id:            userId,
      started_at:         startedAt,
      ended_at:           endedAt,
      actual_duration:    actualDuration,
      estimated_duration: estimatedDuration,
      gap,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Insert a break event (pause → resume) linked to a time_log row.
 */
export async function insertBreakLog({
  timeLogId,
  taskId,
  userId,
  stoppedAt,
  resumedAt,
  breakDuration, // minutes
}) {
  const { error } = await supabase
    .from('break_logs')
    .insert({
      time_log_id:    timeLogId,
      task_id:        taskId,
      user_id:        userId,
      stopped_at:     stoppedAt,
      resumed_at:     resumedAt,
      break_duration: breakDuration,
    });

  if (error) throw error;
}
