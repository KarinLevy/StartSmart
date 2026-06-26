#!/usr/bin/env node
/**
 * seed-lecturer.js — StartSmart Lecturer Demo Seeder
 *
 * Seeds ONE clean demo account with realistic source data so the app can
 * calculate all statistics, charts and insights automatically.
 * Nothing is injected into dashboard or statistics tables directly.
 *
 * ── TWO WAYS TO RUN ─────────────────────────────────────────────────────────
 *
 * PATH A (fully automatic — recommended):
 *   1. Add your service_role key to .env:
 *        SUPABASE_SERVICE_ROLE_KEY=eyJ...   ← Supabase dashboard → Settings → API → service_role
 *   2. Run:
 *        npm run seed:lecturer
 *   This creates demo@startsmart.app in Supabase Auth and seeds all data.
 *
 * PATH B (manual user creation):
 *   1. In Supabase dashboard → Authentication → Users → Add user:
 *        Email:    demo@startsmart.app
 *        Password: Demo2026!
 *        ✓ Auto Confirm User
 *   2. Copy the generated UUID from the user list.
 *   3. Run:
 *        DEMO_USER_ID=<paste-uuid-here> npm run seed:lecturer
 *
 * Both paths produce identical results. Re-running always wipes and recreates
 * the demo data so the account stays clean.
 *
 * ── SECURITY NOTES ──────────────────────────────────────────────────────────
 *  • SUPABASE_SERVICE_ROLE_KEY is dev/seed-only — never used by the frontend
 *  • .env is in .gitignore — never committed
 *  • The service_role key is only read here and never sent to the browser
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync }  from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Load .env manually (no dotenv dep needed) ─────────────────────────────────
const __dir  = dirname(fileURLToPath(import.meta.url));
const envRaw = readFileSync(join(__dir, '../.env'), 'utf8');
const env    = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const SUPABASE_URL      = env['VITE_SUPABASE_URL'];
const SERVICE_ROLE_KEY  = env['SUPABASE_SERVICE_ROLE_KEY'];
const ANON_KEY          = env['VITE_SUPABASE_ANON_KEY'];
const MANUAL_USER_ID    = process.env.DEMO_USER_ID; // PATH B override

const DEMO_EMAIL    = 'demo@startsmart.app';
const DEMO_PASSWORD = 'Demo2026!';

if (!SUPABASE_URL) {
  console.error('❌  VITE_SUPABASE_URL missing from .env');
  process.exit(1);
}
if (!SERVICE_ROLE_KEY && !MANUAL_USER_ID) {
  console.error('');
  console.error('❌  Cannot create demo user — no service_role key and no DEMO_USER_ID provided.');
  console.error('');
  console.error('  Choose one:');
  console.error('');
  console.error('  PATH A (automatic):');
  console.error('    Add to .env:  SUPABASE_SERVICE_ROLE_KEY=<your-key>');
  console.error('    Get it from:  Supabase dashboard → Settings → API → service_role');
  console.error('    Then run:     npm run seed:lecturer');
  console.error('');
  console.error('  PATH B (manual user creation):');
  console.error('    1. Supabase dashboard → Authentication → Users → Add user');
  console.error('       Email: demo@startsmart.app   Password: Demo2026!   ✓ Auto Confirm User');
  console.error('    2. Copy the UUID from the user list');
  console.error('    3. Run:  DEMO_USER_ID=<uuid> npm run seed:lecturer');
  console.error('');
  process.exit(1);
}

// Use service_role key for writes (bypasses RLS — needed for admin seeding)
const WRITE_KEY = SERVICE_ROLE_KEY ?? ANON_KEY;
const sb = createClient(SUPABASE_URL, WRITE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const rand  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick  = arr => arr[Math.floor(Math.random() * arr.length)];

/** ISO timestamp for N days ago, at a realistic work hour */
function daysAgo(n, hour = null) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour ?? rand(8, 18), rand(0, 50), 0, 0);
  return d.toISOString();
}
/** ISO timestamp for N days from now */
function daysAhead(n, hour = null) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour ?? rand(8, 18), rand(0, 50), 0, 0);
  return d.toISOString();
}
const dateOnly = iso => iso.slice(0, 10);

// ── Tag palette (matches app's tagUtils.js preset colors) ────────────────────
const TAGS = [
  { name: 'Work',      color: '#2563eb' },
  { name: 'Tech',      color: '#0e7490' },
  { name: 'Research',  color: '#c2610c' },
  { name: 'Creative',  color: '#be185d' },
  { name: 'Planning',  color: '#a16207' },
  { name: 'Health',    color: '#16a34a' },
  { name: 'Urgent',    color: '#b91c1c' },
  { name: 'Personal',  color: '#16a34a' },
  { name: 'Design',    color: '#be185d' },
  { name: 'Backend',   color: '#0e7490' },
  { name: 'Frontend',  color: '#0e7490' },
  { name: 'Meeting',   color: '#a16207' },
  { name: 'Writing',   color: '#be185d' },
  { name: 'Review',    color: '#2563eb' },
];

// ── Task data ─────────────────────────────────────────────────────────────────
// Each task: { title, desc, est (minutes), tags[], hi (priority), reflection? }
// status and dates are assigned programmatically below.

const COMPLETED_TASKS = [
  // ── Engineering ───────────────────────────────────────────────────────────
  { title: 'Implement JWT refresh token rotation',       desc: 'Add automatic refresh with 15-min expiry and rotation on every use.',              est: 90,  tags: ['Backend','Urgent'],   hi: true,
    reflection: 'Finished ahead of schedule. Good estimation this time.' },
  { title: 'Write unit tests for auth middleware',       desc: 'Cover edge cases: expired token, missing header, invalid signature.',              est: 60,  tags: ['Backend','Review'],   hi: false,
    reflection: 'Had to pause halfway for an unplanned meeting. Lost 20 minutes of context.' },
  { title: 'Refactor database connection pool',          desc: 'Move from static pool to dynamic sizing based on request queue depth.',            est: 75,  tags: ['Backend','Tech'],     hi: false,
    reflection: null },
  { title: 'Set up CI/CD pipeline with GitHub Actions',  desc: 'Build, test, lint and deploy to staging on every PR merge.',                      est: 120, tags: ['Tech','Work'],        hi: true,
    reflection: 'Collaboration cut the time in half — pair programming was the right call.' },
  { title: 'Fix memory leak in WebSocket handler',       desc: 'Subscriptions not cleaned up on disconnect. Tracked with heap snapshot.',         est: 45,  tags: ['Backend','Urgent'],   hi: true,
    reflection: 'Underestimated the debugging phase. Actual was 40% over estimate.' },
  { title: 'Code review: payment service PR',            desc: 'Review Stripe integration, error handling, and idempotency key usage.',           est: 30,  tags: ['Review','Work'],      hi: false,
    reflection: 'Completed in a single focused block — no distractions at all.' },
  { title: 'Migrate user table to new schema',           desc: 'Add soft delete, audit columns, and backfill existing rows.',                     est: 60,  tags: ['Backend','Urgent'],   hi: true,
    reflection: null },
  { title: 'Implement rate limiting middleware',         desc: 'Token bucket per IP and per user. Redis-backed with sliding window.',              est: 90,  tags: ['Backend','Tech'],     hi: false,
    reflection: 'Should have broken this into smaller tasks. Got blocked for 30 minutes.' },
  { title: 'Update API documentation in Swagger',        desc: 'All new endpoints from Q2 sprint need doc coverage.',                             est: 45,  tags: ['Work','Review'],      hi: false,
    reflection: 'The prep work I did the day before paid off. Very smooth execution.' },
  { title: 'Frontend: implement dark mode toggle',       desc: 'CSS custom properties, persist preference to localStorage and user profile.',     est: 45,  tags: ['Frontend','Tech'],    hi: false,
    reflection: 'Very focused session. No interruptions. This is the flow state to aim for.' },
  { title: 'Fix mobile layout in task list view',        desc: 'Cards overflow at 375 px. Resolved with responsive flexbox adjustments.',         est: 30,  tags: ['Frontend','Urgent'],  hi: true,
    reflection: 'Finished in exactly the estimated time. Estimation accuracy is improving.' },
  { title: 'Integrate Sentry error tracking',            desc: 'Add to all services. Configure alerts for critical error thresholds.',            est: 45,  tags: ['Tech','Work'],        hi: false,
    reflection: null },
  { title: 'Add pagination to task history API',         desc: 'Cursor-based. Default page size 25. Include total count header.',                 est: 60,  tags: ['Backend','Review'],   hi: false,
    reflection: 'Realised halfway through I was solving the wrong problem. Pivoted correctly.' },
  { title: 'Patch CVE-2025-3891 in dependency',          desc: 'Urgent: update affected package to latest, run full regression suite.',           est: 20,  tags: ['Urgent','Tech'],      hi: true,
    reflection: 'Interrupted 3 times. Deep work needs protected time blocks.' },
  // ── Product / Strategy ────────────────────────────────────────────────────
  { title: 'Write PRD: AI-powered task suggestions',     desc: 'Define user stories, success metrics, edge cases and rollout plan.',              est: 120, tags: ['Work','Research'],    hi: true,
    reflection: 'The research phase was longer than expected but produced much better output.' },
  { title: 'Conduct user interviews: onboarding flow',   desc: '8 sessions. Synthesise friction points and top drop-off reasons.',               est: 90,  tags: ['Research','Work'],    hi: false,
    reflection: null },
  { title: 'Q2 OKR review presentation',                 desc: 'Present progress, blockers and revised H2 targets to leadership.',               est: 60,  tags: ['Work','Planning'],    hi: true,
    reflection: 'Started late in the day — energy was low. Morning sessions work better for me.' },
  { title: 'Competitive analysis: three productivity apps', desc: 'Feature matrix, pricing, ICP fit and differentiation opportunities.',          est: 90,  tags: ['Research','Work'],    hi: false,
    reflection: 'Good outcome. External research always takes longer than you plan for.' },
  { title: 'Sprint retrospective: prepare action items', desc: 'Collect team feedback and define measurable improvements for next sprint.',       est: 30,  tags: ['Meeting','Planning'], hi: false,
    reflection: 'Took a break mid-task which helped me think more clearly about the problems.' },
  { title: 'Weekly 1:1 prep with engineering lead',      desc: 'Review current blockers, capacity and roadmap alignment before the meeting.',    est: 20,  tags: ['Meeting','Work'],     hi: false,
    reflection: null },
  // ── Design / Creative ────────────────────────────────────────────────────
  { title: 'Design new onboarding flow in Figma',        desc: '12-screen prototype. Reduced steps from 8 to 4. Exported for user testing.',     est: 180, tags: ['Design','Creative'],  hi: true,
    reflection: 'Very satisfied with this result. The iteration time was worth it.' },
  { title: 'Redesign mobile navigation (bottom tab bar)',desc: 'Accessibility-first approach. Tested with screen reader. Created A/B variants.', est: 90,  tags: ['Design','Urgent'],    hi: true,
    reflection: null },
  { title: 'Accessibility audit: WCAG 2.2 AA compliance',desc: 'Colour contrast, focus indicators, keyboard navigation, alt text coverage.',    est: 90,  tags: ['Design','Review'],    hi: true,
    reflection: 'External dependency caused delay. Out of my control but should plan for it.' },
  { title: 'Write UX case study for portfolio',          desc: 'Challenge → process → outcome format. Include before/after metrics.',            est: 90,  tags: ['Writing','Creative'], hi: false,
    reflection: 'Good session overall. Minor scope creep added about 15 minutes.' },
  { title: 'Onboarding team member: architecture walkthrough', desc: 'Covered monorepo structure, coding standards and deployment process.',      est: 90,  tags: ['Work','Meeting'],     hi: false,
    reflection: null },
];

const IN_PROGRESS_TASKS = [
  { title: 'Implement real-time notifications',          desc: 'Evaluate WebSockets vs Server-Sent Events for latency and horizontal scaling.',  est: 120, tags: ['Backend','Frontend'], hi: true  },
  { title: 'Design data export feature',                 desc: 'JSON and CSV exports. Cover all user data per GDPR Article 20 requirements.',   est: 75,  tags: ['Backend','Work'],     hi: false },
  { title: 'Refactor frontend state management',         desc: 'Move from prop drilling to Context API. Evaluate Zustand for complex state.',   est: 90,  tags: ['Frontend','Tech'],    hi: false },
  { title: 'Performance audit: reduce TTI',              desc: 'Time to Interactive > 4s on 3G. Code-split routes, lazy-load non-critical images.', est: 90, tags: ['Frontend','Urgent'], hi: true  },
  { title: 'Redesign pricing page: conversion-focused',  desc: 'Experiment with value-first layout and improved social proof placement.',       est: 120, tags: ['Design','Work'],      hi: false },
  { title: 'Map user journey: free-to-paid conversion',  desc: 'Full end-to-end flow from signup to first successful subscription charge.',     est: 90,  tags: ['Research','Urgent'],  hi: true  },
];

const PENDING_TASKS = [
  { title: 'Plan Q3 technical roadmap',                  desc: 'Align with product on priority features and acceptable technical debt ratio.',  est: 90,  tags: ['Planning','Work'],    hi: false },
  { title: 'Set up feature flag system',                 desc: 'Evaluate LaunchDarkly. Implement gradual rollouts and A/B test infrastructure.', est: 60, tags: ['Tech','Work'],        hi: false },
  { title: 'Set up load testing with k6',                desc: 'Simulate 1 000 concurrent users. Identify bottlenecks before Q3 launch.',      est: 60,  tags: ['Backend','Urgent'],   hi: true  },
  { title: 'Annual security audit prep',                 desc: 'Gather evidence for OWASP compliance checklist. Coordinate with security team.', est: 90, tags: ['Work','Urgent'],      hi: true  },
  { title: 'Implement GraphQL subscriptions',            desc: 'Real-time data feed for dashboard widgets using subscription resolvers.',       est: 120, tags: ['Backend','Tech'],     hi: false },
  { title: 'Write case study: enterprise customer win',  desc: 'Outcome-led story for sales enablement and marketing collateral.',             est: 90,  tags: ['Writing','Work'],     hi: false },
  { title: 'Partner integration discovery: Slack',       desc: 'Technical requirements, API feasibility and user demand validation.',          est: 60,  tags: ['Research','Work'],    hi: false },
  { title: 'Team tech talk: TypeScript advanced patterns',desc: 'Conditional types, mapped types and template literal type tricks.',           est: 90,  tags: ['Work','Tech'],        hi: false },
  { title: 'Review and update CORS policy',              desc: 'Audit allowed origins. Tighten restrictions to production domains only.',      est: 30,  tags: ['Backend','Review'],   hi: false },
  { title: 'Plan product launch event',                  desc: 'Venue, guest list, demo script, press kit and social content calendar.',       est: 90,  tags: ['Planning','Meeting'],  hi: false },
  { title: 'Evaluate edge caching with Cloudflare Workers', desc: 'Prototype static asset delivery and measure latency improvement.',          est: 90,  tags: ['Tech','Planning'],    hi: false },
  { title: 'Contribute to open source: fix issue #1892', desc: 'Good first issue. Fix timezone parsing edge case in popular date library.',   est: 60,  tags: ['Tech','Personal'],    hi: false },
];

// ── Notifications ──────────────────────────────────────────────────────────────
const NOTIFICATIONS = [
  { type: 'reminder', title: 'Task due today',           message: '"Plan Q3 technical roadmap" is scheduled for today. Don\'t forget!',                         is_read: false, daysAgo: 0,  hoursAgo: 0.5 },
  { type: 'time_gap', title: 'Time gap detected',        message: 'Your focus session for "Set up CI/CD pipeline" ran 24 min over estimate.',                   is_read: false, daysAgo: 0,  hoursAgo: 2   },
  { type: 'reminder', title: 'Weekly goal progress',     message: 'You\'ve logged 4h 30m this week — 75% of your 6h daily goal. Keep going!',                   is_read: false, daysAgo: 0,  hoursAgo: 6   },
  { type: 'reminder', title: 'Unstarted task reminder',  message: '"Set up load testing with k6" has been pending for 4 days. Ready to start?',                 is_read: false, daysAgo: 1,  hoursAgo: 0   },
  { type: 'time_gap', title: 'Long session detected',    message: 'You\'ve been in focus mode for 2+ hours. Consider taking a short break.',                     is_read: false, daysAgo: 1,  hoursAgo: 3   },
  { type: 'time_gap', title: 'Focus session complete',   message: 'Great work! You stayed on task for 90 minutes on "Implement JWT refresh token rotation".',    is_read: true,  daysAgo: 1,  hoursAgo: 0   },
  { type: 'reminder', title: 'Daily summary',            message: 'You completed 3 tasks yesterday and logged 2h 45m of focus time. Excellent!',                 is_read: true,  daysAgo: 2,  hoursAgo: 0   },
  { type: 'reminder', title: 'Streak milestone',         message: '5-day productivity streak! You\'ve hit your daily focus goal every day this week.',           is_read: true,  daysAgo: 3,  hoursAgo: 0   },
  { type: 'system',   title: 'Weekly report ready',      message: 'Your week in review: 8 tasks completed, 5h 20m focus time, -8 min average gap.',             is_read: true,  daysAgo: 7,  hoursAgo: 0   },
  { type: 'time_gap', title: 'Excellent estimation!',    message: '"Fix mobile layout in task list view" finished within 3 minutes of your estimate.',           is_read: true,  daysAgo: 12, hoursAgo: 0   },
  { type: 'system',   title: 'New feature: Insights',    message: 'Check out your new Insights dashboard for personalised productivity trends.',                 is_read: true,  daysAgo: 15, hoursAgo: 0   },
  { type: 'system',   title: 'Welcome to StartSmart!',   message: 'Your workspace is all set. Start by creating your first task and running a focus session.',  is_read: true,  daysAgo: 30, hoursAgo: 0   },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🎓  StartSmart Lecturer Demo Seeder');
  console.log('━'.repeat(52));

  // ── Step 1: Resolve user ID ───────────────────────────────────────────────
  let userId;

  if (MANUAL_USER_ID) {
    // PATH B — user was created manually in dashboard
    userId = MANUAL_USER_ID;
    console.log(`\n[1] Using provided user ID: ${userId}`);
    const { data: existing } = await sb.from('profiles').select('id').eq('id', userId).single();
    if (!existing) {
      console.error('    ❌  No profiles row found for this ID.');
      console.error('       Make sure the user was created in Supabase Auth and the trigger ran.');
      process.exit(1);
    }
    console.log('    ✅  User confirmed in profiles table');

  } else {
    // PATH A — create/reset via Admin API (requires service_role key)
    console.log(`\n[1] Creating auth user: ${DEMO_EMAIL}`);

    // Delete existing demo user if present (clean slate)
    const { data: existingUsers } = await sb.auth.admin.listUsers();
    const existing = (existingUsers?.users ?? []).find(u => u.email === DEMO_EMAIL);
    if (existing) {
      await sb.auth.admin.deleteUser(existing.id);
      console.log('    Removed previous demo user');
    }

    const { data: newUser, error: createErr } = await sb.auth.admin.createUser({
      email:          DEMO_EMAIL,
      password:       DEMO_PASSWORD,
      email_confirm:  true,
      user_metadata:  { first_name: 'Demo', last_name: 'User', username: 'demo_startsmart' },
    });
    if (createErr) {
      console.error('    ❌  createUser failed:', createErr.message);
      process.exit(1);
    }
    userId = newUser.user.id;
    console.log(`    ✅  Created: ${userId}`);

    // Wait for DB triggers (profiles + user_settings auto-created)
    await new Promise(r => setTimeout(r, 800));
  }

  // ── Step 2: Wipe any existing demo data for this user ────────────────────
  console.log('\n[2] Clearing previous data…');
  await sb.from('notifications').delete().eq('user_id', userId);
  await sb.from('subscriptions').delete().eq('user_id', userId);
  await sb.from('tasks').delete().eq('user_id', userId);     // cascades to time_logs, break_logs, task_tags
  await sb.from('tags').delete().eq('user_id', userId);
  console.log('    ✅  Cleared');

  // ── Step 3: Profile ───────────────────────────────────────────────────────
  console.log('\n[3] Writing profile…');
  await sb.from('profiles').update({
    first_name:            'Alex',
    last_name:             'Morgan',
    username:              'alex_demo',
    bio:                   'Senior Product Engineer. I use StartSmart to track feature work, planning sessions and personal focus goals across every sprint.',
    language:              'en',
    theme:                 'dark',
    timezone:              'Europe/London',
    avatar_color:          '#6b38d4',
    notifications_enabled: true,
  }).eq('id', userId);
  console.log('    ✅  Profile: Alex Morgan, dark theme, Europe/London');

  // ── Step 4: User settings ─────────────────────────────────────────────────
  console.log('\n[4] Writing user settings…');
  await sb.from('user_settings').upsert({
    user_id:                   userId,
    daily_goal_hours:          6,
    default_estimate_minutes:  45,
    notifications: { taskReminders: true, timeGapAlerts: true, weeklySummary: true, soundEffects: true, focusEndAlert: true },
    focus:         { autoStartBreak: false, showGapLive: true, confirmFinish: true },
    privacy:       { publicProfile: false, shareStats: false },
  }, { onConflict: 'user_id' });
  console.log('    ✅  daily_goal=6h, default_estimate=45m');

  // ── Step 5: Subscription ──────────────────────────────────────────────────
  console.log('\n[5] Writing subscription (Pro)…');
  const subStart = new Date();
  subStart.setDate(subStart.getDate() - 95);
  await sb.from('subscriptions').delete().eq('user_id', userId);
  await sb.from('subscriptions').insert({
    user_id:        userId,
    plan_type:      'pro',
    status:         'active',
    started_at:     subStart.toISOString(),
    expires_at:     new Date(subStart.getTime() + 365 * 86400000).toISOString(),
    billing_period: 'annual',
    renewal_date:   new Date(subStart.getTime() + 365 * 86400000).toISOString(),
  });
  console.log('    ✅  Pro plan, active since ' + subStart.toISOString().slice(0,10));

  // ── Step 6: Tags ──────────────────────────────────────────────────────────
  console.log('\n[6] Creating tags…');
  const tagMap = {};
  for (const tag of TAGS) {
    const { data, error } = await sb.from('tags')
      .upsert({ user_id: userId, tag_name: tag.name, color: tag.color }, { onConflict: 'user_id,tag_name' })
      .select('id').single();
    if (!error && data) tagMap[tag.name] = data.id;
  }
  console.log(`    ✅  ${Object.keys(tagMap).length} tags`);

  // ── Step 7: Tasks + time_logs + break_logs ────────────────────────────────
  console.log('\n[7] Inserting tasks, time logs and break logs…');

  let taskCount = 0, logCount = 0, breakCount = 0;

  // Helper: insert one task and its time log + optional break log
  async function insertTask(taskDef, status, scheduledIso) {
    const isComplete = status === 'done';

    const { data: taskRow, error: taskErr } = await sb.from('tasks').insert({
      user_id:            userId,
      title:              taskDef.title,
      description:        taskDef.desc,
      estimated_duration: taskDef.est,
      scheduled_date:     dateOnly(scheduledIso),
      task_status:        status,
      priority_high:      taskDef.hi,
      completed_at:       isComplete ? scheduledIso : null,
      reflection:         isComplete ? (taskDef.reflection ?? null) : null,
    }).select('id').single();

    if (taskErr) { console.error('    ❌ task insert:', taskErr.message, taskDef.title); return; }
    taskCount++;

    // Tag associations
    const tagIds = (taskDef.tags ?? []).map(n => tagMap[n]).filter(Boolean);
    if (tagIds.length) {
      await sb.from('task_tags').insert(tagIds.map(tagId => ({ task_id: taskRow.id, tag_id: tagId })));
    }

    if (!isComplete) return;

    // ── Time log with realistic variance ─────────────────────────────────────
    // Cycle through 5 variance patterns so the dataset has meaningful spread:
    //   early (-25%), slightly early (-10%), on time (+5%), late (+20%), very late (+45%)
    const variantPct = [[-0.25], [-0.10], [0.05], [0.20], [0.45]][taskCount % 5][0];
    const actualMins = Math.max(5, Math.round(taskDef.est * (1 + variantPct)));
    const gap        = actualMins - taskDef.est;

    const started = new Date(scheduledIso);
    started.setHours(rand(8, 14), rand(0, 30), 0, 0);
    const ended = new Date(started.getTime() + actualMins * 60000);

    const { data: logRow, error: logErr } = await sb.from('time_logs').insert({
      task_id:            taskRow.id,
      user_id:            userId,
      started_at:         started.toISOString(),
      ended_at:           ended.toISOString(),
      estimated_duration: taskDef.est,
      actual_duration:    actualMins,
      gap,
    }).select('id').single();

    if (logErr) { console.error('    ❌ time_log:', logErr.message); return; }
    logCount++;

    // Break log: ~35% of sessions longer than 30 min
    if (actualMins > 30 && Math.random() < 0.35) {
      const bStart = new Date(started.getTime() + Math.floor(actualMins * 0.4) * 60000);
      const bMins  = rand(7, 18);
      const bEnd   = new Date(bStart.getTime() + bMins * 60000);
      if (bEnd < ended) {
        const { error: brErr } = await sb.from('break_logs').insert({
          time_log_id:    logRow.id,
          task_id:        taskRow.id,
          user_id:        userId,
          stopped_at:     bStart.toISOString(),
          resumed_at:     bEnd.toISOString(),
          break_duration: bMins,
        });
        if (!brErr) breakCount++;
      }
    }
  }

  // Completed: spread across last 30 days (oldest first)
  for (let i = 0; i < COMPLETED_TASKS.length; i++) {
    const daysBack = 30 - Math.floor((i / (COMPLETED_TASKS.length - 1)) * 29);
    await insertTask(COMPLETED_TASKS[i], 'done', daysAgo(daysBack));
  }

  // In-progress: today and yesterday
  for (let i = 0; i < IN_PROGRESS_TASKS.length; i++) {
    const offset = i < 3 ? 0 : 1;
    await insertTask(IN_PROGRESS_TASKS[i], 'in_progress', daysAgo(offset));
  }

  // Pending: today through +14 days
  const pendingOffsets = [0, 1, 2, 3, 4, 5, 7, 7, 10, 10, 14, 14];
  for (let i = 0; i < PENDING_TASKS.length; i++) {
    const scheduled = pendingOffsets[i] === 0
      ? daysAgo(0)
      : daysAhead(pendingOffsets[i]);
    await insertTask(PENDING_TASKS[i], 'pending', scheduled);
  }

  console.log(`    ✅  ${taskCount} tasks | ${logCount} time logs | ${breakCount} break logs`);

  // ── Step 8: Notifications ─────────────────────────────────────────────────
  console.log('\n[8] Inserting notifications…');
  for (const n of NOTIFICATIONS) {
    const ts = new Date();
    ts.setDate(ts.getDate() - n.daysAgo);
    ts.setHours(ts.getHours() - Math.floor(n.hoursAgo), ts.getMinutes() - Math.round((n.hoursAgo % 1) * 60), 0, 0);

    await sb.from('notifications').insert({
      user_id:    userId,
      type:       n.type,
      title:      n.title,
      message:    n.message,
      is_read:    n.is_read,
      created_at: ts.toISOString(),
    });
  }
  console.log(`    ✅  ${NOTIFICATIONS.length} notifications (${NOTIFICATIONS.filter(n => !n.is_read).length} unread)`);

  // ── Done ──────────────────────────────────────────────────────────────────
  const totalUnread = NOTIFICATIONS.filter(n => !n.is_read).length;
  console.log('\n' + '━'.repeat(52));
  console.log('🎉  Lecturer demo environment ready!\n');
  console.log('  Login credentials:');
  console.log(`    Email:    ${DEMO_EMAIL}`);
  console.log(`    Password: ${DEMO_PASSWORD}`);
  console.log(`    User ID:  ${userId}`);
  console.log('');
  console.log('  Data seeded:');
  console.log(`    Tasks:          ${taskCount}  (${COMPLETED_TASKS.length} done · ${IN_PROGRESS_TASKS.length} in-progress · ${PENDING_TASKS.length} pending)`);
  console.log(`    Time logs:      ${logCount}`);
  console.log(`    Break logs:     ${breakCount}`);
  console.log(`    Notifications:  ${NOTIFICATIONS.length}  (${totalUnread} unread)`);
  console.log(`    Tags:           ${Object.keys(tagMap).length}`);
  console.log(`    Subscription:   Pro (active)`);
  console.log('');
  console.log('  To reseed at any time:');
  console.log('    npm run seed:lecturer');
  console.log('');
  console.log('  ⚠️  All statistics, charts and insights are calculated by the app');
  console.log('     from the seeded source data — nothing is hardcoded.');
  console.log('');
}

seed().catch(e => { console.error('\nFATAL:', e.message); process.exit(1); });
