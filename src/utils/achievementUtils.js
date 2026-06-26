/**
 * achievementUtils.js
 *
 * All achievement unlock logic and current-streak calculation.
 * Both Profile and Insights derive their state from these pure functions
 * so the two pages always agree.
 *
 * Input: the `tasks` array from TasksContext (already shaped by fromDB).
 *   task.status          — 'done' | 'in_progress' | 'pending'
 *   task.completedAt     — ISO string or null
 *   task.estimatedMinutes — number
 *   task.actualMinutes   — number | null  (from latest time_log)
 *   task.gap             — number | null
 *   task.tags            — Array<{ name: string, color: string }>
 */

// ── Streak ────────────────────────────────────────────────────────────────────

/**
 * Calculate the current consecutive-day productivity streak.
 *
 * A day counts if at least one task was completed on that date
 * (based on completedAt). If today has no completions yet but
 * yesterday does, the streak is still active (not broken until
 * midnight passes with no completion).
 *
 * @param {Array} tasks — full tasks array from TasksContext
 * @returns {number} streak in days
 */
export function calcStreak(tasks) {
  const doneTasks = tasks.filter((t) => t.status === 'done' && t.completedAt);
  if (doneTasks.length === 0) return 0;

  // Build a Set of date strings "YYYY-MM-DD" for every day that had a completion
  const completedDates = new Set(
    doneTasks.map((t) => t.completedAt.slice(0, 10))
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Choose starting point: today if something was completed today,
  // yesterday if not (streak still valid — day isn't over yet).
  let start;
  if (completedDates.has(todayStr)) {
    start = new Date(today);
  } else if (completedDates.has(yesterdayStr)) {
    start = new Date(yesterday);
  } else {
    return 0; // Both today and yesterday missed — streak is broken
  }

  // Walk backwards counting consecutive days
  let streak = 0;
  const cursor = new Date(start);
  while (completedDates.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

// ── Shared achievement definitions ────────────────────────────────────────────

/**
 * Compute all achievement unlock states from real task data.
 *
 * @param {Array} tasks — full tasks array from TasksContext
 * @returns {{ achievements: Array, streakDays: number, accuracy: number|null }}
 */
export function computeAchievements(tasks) {
  const done = tasks.filter((t) => t.status === 'done');

  // Estimation accuracy (same formula as Insights)
  const withLogs = done.filter((t) => t.estimatedMinutes && t.actualMinutes);
  const totalEst = withLogs.reduce((s, t) => s + t.estimatedMinutes, 0);
  const totalAct = withLogs.reduce((s, t) => s + t.actualMinutes, 0);
  const accuracy = withLogs.length > 0
    ? Math.min(Math.round((totalEst / totalAct) * 100), 100)
    : null;

  // Streak
  const streakDays = calcStreak(tasks);

  // Tag-based focus time (minutes of actual time on tasks with a given tag)
  const focusMinsByTag = (tagName) =>
    done
      .filter((t) => t.tags?.some((tag) => tag.name.toLowerCase() === tagName.toLowerCase()))
      .reduce((s, t) => s + (t.actualMinutes || t.estimatedMinutes || 0), 0);

  const studyMins = focusMinsByTag('Study');
  const workMins  = focusMinsByTag('Work');

  const achievements = [
    {
      key:         'first_task',
      icon:        '🏆',
      iconMat:     'emoji_events',
      title:       'First Task',
      description: 'Complete your first task.',
      unlocked:    done.length >= 1,
      value:       done.length >= 1 ? `${done.length} task${done.length !== 1 ? 's' : ''} completed` : null,
    },
    {
      key:         'streak_7',
      icon:        '🔥',
      iconMat:     'local_fire_department',
      title:       '7-Day Streak',
      description: '7 consecutive productive days.',
      unlocked:    streakDays >= 7,
      value:       streakDays >= 7 ? `${streakDays}-day streak` : null,
    },
    {
      key:         'accuracy_90',
      icon:        '🎯',
      iconMat:     'adjust',
      title:       '90% Accuracy',
      description: 'Estimation accuracy above 90%.',
      unlocked:    accuracy !== null && accuracy >= 90,
      value:       accuracy !== null ? `${accuracy}% accuracy` : null,
    },
    {
      key:         'tasks_100',
      icon:        '⭐',
      iconMat:     'star',
      title:       '100 Tasks',
      description: 'Complete 100 tasks total.',
      unlocked:    done.length >= 100,
      value:       done.length >= 100 ? `${done.length} tasks` : `${done.length} / 100`,
    },
    {
      key:         'study_master',
      icon:        '📚',
      iconMat:     'school',
      title:       'Study Master',
      description: 'Log 10 h of study focus time.',
      unlocked:    studyMins >= 600,
      value:       studyMins >= 600 ? `${Math.floor(studyMins / 60)}h ${studyMins % 60}m study time` : null,
    },
    {
      key:         'work_champion',
      icon:        '💼',
      iconMat:     'work',
      title:       'Work Champion',
      description: 'Log 10 h of work focus time.',
      unlocked:    workMins >= 600,
      value:       workMins >= 600 ? `${Math.floor(workMins / 60)}h ${workMins % 60}m work time` : null,
    },
  ];

  return { achievements, streakDays, accuracy };
}
