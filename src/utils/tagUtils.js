/**
 * tagUtils.js — Smart Tag System utilities
 *
 * Designed for easy extension:
 *   - Replace KEYWORD_MAP with an AI/backend call for smarter suggestions
 *   - Swap localStorage with an API call for server-persisted preferences
 *   - Add a Tag registry / categories / analytics in the same shape
 */

// ── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_COLOR = '#6b38d4';
export const MAX_TAGS      = 8;
export const TAG_MAX_LEN   = 24;

export const TAG_PRESETS = [
  { color: '#6b38d4', label: 'Purple', hint: 'Study / University' },
  { color: '#2563eb', label: 'Blue',   hint: 'Work'              },
  { color: '#16a34a', label: 'Green',  hint: 'Personal'          },
  { color: '#c2610c', label: 'Orange', hint: 'Planning'          },
  { color: '#b91c1c', label: 'Red',    hint: 'Urgent'            },
  { color: '#a16207', label: 'Yellow', hint: 'Reminder'          },
  { color: '#be185d', label: 'Pink',   hint: 'Creative'          },
  { color: '#0e7490', label: 'Cyan',   hint: 'Technical'         },
  { color: '#525f6b', label: 'Gray',   hint: 'General'           },
];

// ── Keyword → color map ───────────────────────────────────────────────────────
// Replace or augment this with a backend/AI call when ready.

const KEYWORD_MAP = [
  {
    color: '#b91c1c',
    keywords: ['urgent', 'critical', 'asap', 'deadline', 'emergency', 'alert', 'rush', 'blocker'],
  },
  {
    color: '#0e7490',
    keywords: [
      'backend', 'frontend', 'react', 'javascript', 'typescript', 'nodejs', 'node',
      'ai', 'ml', 'dev', 'development', 'programming', 'code', 'coding', 'api',
      'database', 'css', 'html', 'vue', 'python', 'java', 'software', 'tech',
      'bug', 'feature', 'pr', 'git', 'data', 'devops', 'cloud', 'docker',
    ],
  },
  {
    color: '#2563eb',
    keywords: [
      'work', 'office', 'client', 'business', 'job', 'career', 'professional',
      'company', 'team', 'colleague', 'corporate', 'project', 'sprint',
    ],
  },
  {
    color: '#6b38d4',
    keywords: [
      'study', 'exam', 'homework', 'university', 'school', 'course', 'lecture',
      'assignment', 'thesis', 'quiz', 'class', 'college', 'semester',
    ],
  },
  {
    color: '#c2610c',
    keywords: [
      'meeting', 'calendar', 'planning', 'plan', 'schedule', 'event',
      'standup', 'sync', 'agenda', 'kickoff', 'retro', 'sprint',
    ],
  },
  {
    color: '#16a34a',
    keywords: [
      'personal', 'family', 'home', 'health', 'fitness', 'gym', 'sport',
      'life', 'self', 'wellness', 'hobby', 'leisure',
    ],
  },
  {
    color: '#a16207',
    keywords: ['shopping', 'reminder', 'grocery', 'buy', 'list', 'shop', 'purchase', 'todo'],
  },
  {
    color: '#be185d',
    keywords: [
      'design', 'creative', 'ideas', 'art', 'illustration', 'ux', 'ui',
      'figma', 'branding', 'logo', 'visual', 'graphic',
    ],
  },
  {
    color: '#525f6b',
    keywords: ['general', 'misc', 'other', 'miscellaneous', 'note'],
  },
];

/**
 * Suggest a color for a tag name based on keyword matching.
 * Returns DEFAULT_COLOR if no keyword matches.
 */
export function suggestColor(name) {
  if (!name?.trim()) return DEFAULT_COLOR;
  const lower = name.toLowerCase().trim();
  for (const { color, keywords } of KEYWORD_MAP) {
    if (keywords.some((k) => lower === k || lower.includes(k))) return color;
  }
  return DEFAULT_COLOR;
}

// ── User preference persistence ───────────────────────────────────────────────
// Swap these two functions with API calls when backend is ready.

const PREFS_KEY = 'ss_tag_preferences';

function loadPreferences() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); } catch { return {}; }
}

/**
 * Persist the user's explicit color choice for a tag name.
 * Call only when the user manually selects a color (not auto-suggested).
 */
export function saveTagPreference(name, color) {
  if (!name?.trim()) return;
  const prefs = loadPreferences();
  prefs[name.toLowerCase().trim()] = color;
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {}
}

/**
 * Retrieve the user's saved color preference for a tag name.
 * Returns null if no preference has been saved.
 */
export function getTagPreference(name) {
  if (!name?.trim()) return null;
  return loadPreferences()[name.toLowerCase().trim()] ?? null;
}

// ── Color resolution priority ─────────────────────────────────────────────────

/**
 * Resolve the best color for a tag given the current state.
 * Priority: user preference > keyword suggestion > default
 * Returns { color, source } where source is 'preference' | 'suggested' | 'default'
 */
export function resolveColor(name) {
  if (!name?.trim()) return { color: DEFAULT_COLOR, source: 'default' };
  const pref = getTagPreference(name);
  if (pref) return { color: pref, source: 'preference' };
  const suggested = suggestColor(name);
  if (suggested !== DEFAULT_COLOR) return { color: suggested, source: 'suggested' };
  return { color: DEFAULT_COLOR, source: 'default' };
}

// ── Tag validation ─────────────────────────────────────────────────────────────

/**
 * Validate a tag name against the current tag list.
 * Returns an error string or null if valid.
 */
export function validateTag(name, existingTags) {
  const trimmed = name.trim();
  if (!trimmed) return 'Please enter a tag name.';
  if (trimmed.length > TAG_MAX_LEN) return `Tags can be at most ${TAG_MAX_LEN} characters.`;
  if (existingTags.length >= MAX_TAGS) return `You can add up to ${MAX_TAGS} tags per task.`;
  if (existingTags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
    return `"${trimmed}" is already added.`;
  }
  return null;
}

// ── Existing-tag suggestion helper ────────────────────────────────────────────

/**
 * Collect unique tags from an array of tasks (deduped by name, case-insensitive).
 * Used to suggest previously created tags while typing.
 */
export function collectExistingTags(tasks) {
  const seen = new Map();
  tasks.forEach((t) => {
    (t.tags || []).forEach((tag) => {
      const key = tag.name.toLowerCase();
      if (!seen.has(key)) seen.set(key, tag);
    });
  });
  return Array.from(seen.values());
}

/**
 * Filter existing tags that match the current input and aren't already added.
 */
export function filterSuggestions(input, existingTags, currentTags, limit = 5) {
  const q = input.trim().toLowerCase();
  if (!q) return [];
  return existingTags
    .filter((et) =>
      et.name.toLowerCase().includes(q) &&
      !currentTags.some((t) => t.name.toLowerCase() === et.name.toLowerCase())
    )
    .slice(0, limit);
}
