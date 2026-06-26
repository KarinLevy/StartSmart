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
  { color: '#6b38d4', label: 'Purple', hint: 'Default / General'  },
  { color: '#2563eb', label: 'Blue',   hint: 'Work'               },
  { color: '#16a34a', label: 'Green',  hint: 'Personal'           },
  { color: '#c2610c', label: 'Orange', hint: 'Study / University' },
  { color: '#b91c1c', label: 'Red',    hint: 'Urgent'             },
  { color: '#a16207', label: 'Yellow', hint: 'Reminder'           },
  { color: '#be185d', label: 'Pink',   hint: 'Creative'           },
  { color: '#0e7490', label: 'Cyan',   hint: 'Technical'          },
];

// ── Keyword → color map ───────────────────────────────────────────────────────
// Supports English and Hebrew. Ordered from most-specific to least-specific to
// avoid false matches. Replace or augment with a backend/AI call when ready.
//
// Matching strategy:
//   1. Exact match on the full trimmed input (highest priority)
//   2. Token match — the keyword appears as a whitespace-separated word
//   3. Substring match — keyword found anywhere (last resort, catches compounds)

const KEYWORD_MAP = [
  // ── Urgent / Red ──────────────────────────────────────────────────────────
  {
    color: '#b91c1c',
    keywords: [
      // English
      'urgent', 'critical', 'asap', 'deadline', 'emergency', 'alert', 'rush', 'blocker',
      'important', 'priority',
      // Hebrew
      'דחוף', 'בהול', 'חשוב', 'קריטי', 'דדליין', 'חירום',
    ],
  },

  // ── Technical / Cyan ──────────────────────────────────────────────────────
  {
    color: '#0e7490',
    keywords: [
      // English
      'backend', 'frontend', 'react', 'javascript', 'typescript', 'nodejs', 'node',
      'vue', 'angular', 'svelte', 'python', 'java', 'golang', 'rust', 'swift',
      'kotlin', 'php', 'ruby', 'scala', 'cpp', 'csharp',
      'ai', 'ml', 'llm', 'devops', 'docker', 'kubernetes', 'aws', 'gcp', 'azure',
      'database', 'sql', 'mongodb', 'redis', 'graphql', 'rest', 'api', 'grpc',
      'development', 'programming', 'coding', 'code', 'software', 'tech', 'git',
      'github', 'testing', 'deployment', 'infrastructure', 'architecture',
      'algorithm', 'debugging', 'refactor', 'migration', 'integration',
      // Hebrew
      'בקאנד', 'פרונטאנד', 'ריאקט', "ג'אווהסקריפט", 'טייפסקריפט', 'פייתון',
      'פיתוח', 'תכנות', 'קוד', 'תוכנה', 'טכנולוגיה', 'בינה מלאכותית',
      'מסד נתונים', 'ארכיטקטורה', 'דיפלוימנט',
    ],
  },

  // ── Work / Blue ───────────────────────────────────────────────────────────
  {
    color: '#2563eb',
    keywords: [
      // English
      'work', 'office', 'client', 'business', 'job', 'career', 'professional',
      'company', 'team', 'colleague', 'corporate', 'project', 'sprint',
      'manager', 'report', 'presentation', 'proposal',
      // Hebrew
      'עבודה', 'משרד', 'לקוח', 'עסק', 'קריירה', 'חברה', 'צוות',
      'פרויקט עבודה', 'פרזנטציה', 'הצעה',
    ],
  },

  // ── Study / University / Orange ───────────────────────────────────────────
  {
    color: '#c2610c',
    keywords: [
      // English
      'study', 'exam', 'homework', 'university', 'school', 'course', 'lecture',
      'assignment', 'thesis', 'quiz', 'class', 'college', 'semester', 'grade',
      'academic', 'research', 'tutorial', 'lesson',
      // Hebrew
      'לימודים', 'מבחן', 'שיעורי בית', 'אוניברסיטה', 'בית ספר', 'קורס',
      'הרצאה', 'עבודה אקדמית', 'תזה', 'בגרות', 'מכללה', 'סמסטר',
      'מטלה', 'שיעור',
    ],
  },

  // ── Personal / Green ──────────────────────────────────────────────────────
  {
    color: '#16a34a',
    keywords: [
      // English
      'personal', 'family', 'home', 'health', 'fitness', 'gym', 'sport',
      'life', 'self', 'wellness', 'hobby', 'leisure', 'birthday', 'vacation',
      'travel', 'relax', 'friend', 'social',
      // Hebrew
      'אישי', 'משפחה', 'בית', 'בריאות', 'כושר', 'ספורט', 'יום הולדת',
      'חופשה', 'טיול', 'חבר', 'חברה', 'נופש', 'תחביב',
    ],
  },

  // ── Reminder / Yellow ─────────────────────────────────────────────────────
  {
    color: '#a16207',
    keywords: [
      // English
      'reminder', 'shopping', 'grocery', 'buy', 'shop', 'purchase', 'todo',
      'errand', 'remember', 'note to self',
      // Hebrew
      'תזכורת', 'קניות', 'לקנות', 'לזכור', 'מכולת', 'סופר', 'רשימת קניות',
    ],
  },

  // ── Creative / Pink ───────────────────────────────────────────────────────
  {
    color: '#be185d',
    keywords: [
      // English
      'design', 'creative', 'idea', 'ideas', 'art', 'illustration', 'ux', 'ui',
      'figma', 'branding', 'logo', 'visual', 'graphic', 'writing', 'content',
      'photography', 'video', 'music', 'animation',
      // Hebrew
      'עיצוב', 'יצירתי', 'רעיון', 'רעיונות', 'אמנות', 'כתיבה', 'תוכן',
      'צילום', 'וידאו', 'מוזיקה', 'ממשק',
    ],
  },
];

/**
 * Normalize a tag name for matching: trim, collapse spaces, lowercase English.
 * Preserves Hebrew characters as-is (Hebrew has no lowercase).
 */
function normalize(name) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Suggest a color for a tag name using a three-tier match strategy:
 *   1. Exact match on the full normalized input
 *   2. Token match — keyword is a whole word within the input
 *   3. Substring match — keyword appears anywhere (catches compounds)
 * Returns DEFAULT_COLOR when no keyword matches.
 */
export function suggestColor(name) {
  if (!name?.trim()) return DEFAULT_COLOR;
  const input = normalize(name);

  for (const { color, keywords } of KEYWORD_MAP) {
    // Tier 1: exact full-input match
    if (keywords.some((k) => input === k)) return color;
  }
  for (const { color, keywords } of KEYWORD_MAP) {
    // Tier 2: whole-word (token) match
    const tokens = input.split(/\s+/);
    if (keywords.some((k) => tokens.includes(k))) return color;
  }
  for (const { color, keywords } of KEYWORD_MAP) {
    // Tier 3: substring match (for compound words like "לקוח עסקי", "backend-api")
    if (keywords.some((k) => k.length >= 4 && input.includes(k))) return color;
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
