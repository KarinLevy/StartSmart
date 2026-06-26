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
 * @param {Function} t — translation function from useLocale()
 * @returns {{ achievements: Array, streakDays: number, accuracy: number|null }}
 */
export function computeAchievements(tasks, t) {
  // Fallback if t is not provided (backwards compatibility)
  const tr = t || ((key) => key);

  const done = tasks.filter((task) => task.status === 'done');

  // Estimation accuracy (same formula as Insights)
  const withLogs = done.filter((task) => task.estimatedMinutes && task.actualMinutes);
  const totalEst = withLogs.reduce((s, task) => s + task.estimatedMinutes, 0);
  const totalAct = withLogs.reduce((s, task) => s + task.actualMinutes, 0);
  const accuracy = withLogs.length > 0
    ? Math.min(Math.round((totalEst / totalAct) * 100), 100)
    : null;

  // Streak
  const streakDays = calcStreak(tasks);

  // Tag-based focus time (minutes of actual time on tasks with a given tag)
  const focusMinsByTag = (tagName) =>
    done
      .filter((task) => task.tags?.some((tag) => tag.name.toLowerCase() === tagName.toLowerCase()))
      .reduce((s, task) => s + (task.actualMinutes || task.estimatedMinutes || 0), 0);

  const studyMins = focusMinsByTag('Study');
  const workMins  = focusMinsByTag('Work');

  const achievements = [
    {
      key:         'first_task',
      icon:        '🏆',
      iconMat:     'emoji_events',
      title:       tr('achievement.firstTask.title'),
      description: tr('achievement.firstTask.desc'),
      unlocked:    done.length >= 1,
      value:       done.length >= 1
        ? tr('achievement.firstTask.value', { n: done.length, s: done.length !== 1 ? 's' : '' })
        : null,
    },
    {
      key:         'streak_7',
      icon:        '🔥',
      iconMat:     'local_fire_department',
      title:       tr('achievement.streak7.title'),
      description: tr('achievement.streak7.desc'),
      unlocked:    streakDays >= 7,
      value:       streakDays >= 7 ? tr('achievement.streak7.value', { n: streakDays }) : null,
    },
    {
      key:         'accuracy_90',
      icon:        '🎯',
      iconMat:     'adjust',
      title:       tr('achievement.accuracy90.title'),
      description: tr('achievement.accuracy90.desc'),
      unlocked:    accuracy !== null && accuracy >= 90,
      value:       accuracy !== null ? tr('achievement.accuracy90.value', { pct: accuracy }) : null,
    },
    {
      key:         'tasks_100',
      icon:        '⭐',
      iconMat:     'star',
      title:       tr('achievement.tasks100.title'),
      description: tr('achievement.tasks100.desc'),
      unlocked:    done.length >= 100,
      value:       done.length >= 100
        ? tr('achievement.tasks100.value', { n: done.length })
        : tr('achievement.tasks100.progress', { n: done.length }),
    },
    {
      key:         'study_master',
      icon:        '📚',
      iconMat:     'school',
      title:       tr('achievement.studyMaster.title'),
      description: tr('achievement.studyMaster.desc'),
      unlocked:    studyMins >= 600,
      value:       studyMins >= 600
        ? tr('achievement.studyMaster.value', { h: Math.floor(studyMins / 60), m: studyMins % 60 })
        : null,
    },
    {
      key:         'work_champion',
      icon:        '💼',
      iconMat:     'work',
      title:       tr('achievement.workChampion.title'),
      description: tr('achievement.workChampion.desc'),
      unlocked:    workMins >= 600,
      value:       workMins >= 600
        ? tr('achievement.workChampion.value', { h: Math.floor(workMins / 60), m: workMins % 60 })
        : null,
    },
  ];

  return { achievements, streakDays, accuracy };
}
