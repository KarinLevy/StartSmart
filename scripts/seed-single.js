#!/usr/bin/env node
/**
 * seed-single.js — Seed demo data for ONE existing authenticated user.
 *
 * Use this when you have a real Supabase user but don't have the service_role
 * key to create new auth users.  It populates tags, tasks, time_logs,
 * break_logs, notifications, subscriptions and user_settings for the given
 * user ID without touching auth.users.
 *
 * Usage:
 *   USER_ID=<uuid> npm run seed:single
 *
 * The USER_ID must already exist in auth.users (i.e. the user has signed up).
 * The profiles and user_settings rows are auto-created by DB triggers on signup.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { TASK_TEMPLATES, TAG_PALETTE, REFLECTIONS, NOTIFICATION_TEMPLATES, SETTINGS_BY_PLAN } from './seed-data.js';

const __dir  = dirname(fileURLToPath(import.meta.url));
const envRaw = readFileSync(join(__dir, '../.env'), 'utf8');
const env    = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const ANON_KEY     = env['VITE_SUPABASE_ANON_KEY'];
// Prefer service role for writes (bypasses RLS); fall back to anon
const WRITE_KEY    = env['SUPABASE_SERVICE_ROLE_KEY'] || ANON_KEY;
const USER_ID      = process.env.USER_ID;

if (!SUPABASE_URL || !WRITE_KEY) {
  console.error('❌  VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be in .env');
  process.exit(1);
}
if (!USER_ID) {
  console.error('❌  Provide USER_ID as environment variable:');
  console.error('   USER_ID=<your-uuid> npm run seed:single');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, WRITE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function rand(min, max)  { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr)        { return arr[Math.floor(Math.random() * arr.length)]; }

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(rand(8, 20), rand(0, 59), 0, 0);
  return d.toISOString();
}
function daysAhead(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(rand(8, 20), rand(0, 59), 0, 0);
  return d.toISOString();
}
function dateOnly(iso)   { return iso.slice(0, 10); }

async function seed() {
  console.log(`\n🌱  Seeding demo data for user: ${USER_ID}`);
  console.log('━'.repeat(50));

  // ── Wipe existing demo data for this user ─────────────────────────────────
  console.log('\n[1] Clearing existing data…');
  await sb.from('notifications').delete().eq('user_id', USER_ID);
  await sb.from('subscriptions').delete().eq('user_id', USER_ID);
  // Tasks cascade to time_logs, break_logs, task_tags
  await sb.from('tasks').delete().eq('user_id', USER_ID);
  await sb.from('tags').delete().eq('user_id', USER_ID);
  console.log('  ✅ Cleared');

  // ── Tags ──────────────────────────────────────────────────────────────────
  console.log('\n[2] Creating tags…');
  const TAG_NAMES = ['Work','Tech','Study','Creative','Planning','Health','Urgent','Personal','Design','Research','Backend','Frontend','Meeting','Writing','Review','Fitness'];
  const tagMap = {};
  for (const name of TAG_NAMES) {
    const preset = TAG_PALETTE.find(t => t.name === name) ?? { color: '#6b38d4' };
    const { data, error } = await sb.from('tags')
      .upsert({ user_id: USER_ID, tag_name: name, color: preset.color }, { onConflict: 'user_id,tag_name' })
      .select('id').single();
    if (!error && data) tagMap[name] = data.id;
  }
  console.log(`  ✅ ${Object.keys(tagMap).length} tags`);

  // ── Tasks (use engineer mix for a rich varied dataset) ───────────────────
  console.log('\n[3] Creating tasks…');
  const templates = TASK_TEMPLATES['engineer'];
  const allTasks  = [
    ...templates.completed.map(t => ({ ...t, status: 'done' })),
    ...templates.in_progress.map(t => ({ ...t, status: 'in_progress' })),
    ...templates.pending.map(t => ({ ...t, status: 'pending' })),
    // Mix in some PM and designer tasks for variety
    ...TASK_TEMPLATES['pm'].completed.slice(0, 5).map(t => ({ ...t, status: 'done' })),
    ...TASK_TEMPLATES['designer'].completed.slice(0, 3).map(t => ({ ...t, status: 'done' })),
    ...TASK_TEMPLATES['pm'].pending.slice(0, 3).map(t => ({ ...t, status: 'pending' })),
  ];

  let taskCount = 0, logCount = 0, breakCount = 0;

  for (const t of allTasks) {
    const isComplete   = t.status === 'done';
    const isInProgress = t.status === 'in_progress';

    let scheduledIso;
    if (isComplete) {
      scheduledIso = daysAgo(rand(1, 25));
    } else if (isInProgress) {
      scheduledIso = daysAgo(rand(0, 2));
    } else {
      const offset = pick([0, 1, 2, 3, 5, 7, 10, 14]);
      scheduledIso = daysAhead(offset);
    }

    const reflection = isComplete && Math.random() > 0.35 ? pick(REFLECTIONS) : null;

    const { data: taskRow, error: taskErr } = await sb.from('tasks').insert({
      user_id:            USER_ID,
      title:              t.title,
      description:        t.desc,
      estimated_duration: t.est,
      scheduled_date:     dateOnly(scheduledIso),
      task_status:        t.status,
      priority_high:      t.hi,
      completed_at:       isComplete ? scheduledIso : null,
      reflection,
    }).select('id').single();

    if (taskErr) { console.error('  ❌ task:', taskErr.message, t.title); continue; }
    taskCount++;

    // Tag associations
    const taskTagIds = (t.tags ?? []).map(n => tagMap[n]).filter(Boolean);
    if (taskTagIds.length) {
      await sb.from('task_tags').insert(taskTagIds.map(tagId => ({ task_id: taskRow.id, tag_id: tagId })));
    }

    // Time log for completed tasks
    if (isComplete) {
      const started = new Date(scheduledIso);
      started.setHours(rand(8,16), rand(0,30), 0, 0);
      const gapMins  = rand(-Math.floor(t.est*0.3), Math.floor(t.est*0.5));
      const actual   = Math.max(5, t.est + gapMins);
      const ended    = new Date(started.getTime() + actual * 60000);

      const logPayload = {
        task_id: taskRow.id, user_id: USER_ID,
        started_at: started.toISOString(), ended_at: ended.toISOString(),
        estimated_duration: t.est, actual_duration: actual, gap: actual - t.est,
      };
      const { data: logRow, error: logErr } = await sb.from('time_logs').insert(logPayload).select('id').single();
      if (!logErr && logRow) {
        logCount++;
        // ~40% break rate
        if (Math.random() < 0.4 && actual > 30) {
          const bStart = new Date(started.getTime() + rand(20, Math.floor(actual*0.6))*60000);
          const bMins  = rand(5, 20);
          const bEnd   = new Date(bStart.getTime() + bMins*60000);
          if (bEnd < ended) {
            await sb.from('break_logs').insert({
              time_log_id: logRow.id, task_id: taskRow.id, user_id: USER_ID,
              stopped_at: bStart.toISOString(), resumed_at: bEnd.toISOString(), break_duration: bMins,
            });
            breakCount++;
          }
        }
      }
    }
  }
  console.log(`  ✅ ${taskCount} tasks | ${logCount} time logs | ${breakCount} break logs`);

  // ── Notifications ─────────────────────────────────────────────────────────
  console.log('\n[4] Creating notifications…');
  const sampleTitles = allTasks.filter(t => t.status === 'pending').slice(0, 3).map(t => t.title);
  const notifRows = NOTIFICATION_TEMPLATES.map((tmpl, i) => ({
    user_id:    USER_ID,
    type:       tmpl.type,
    title:      tmpl.title,
    message:    tmpl.body.replace('{title}', sampleTitles[i % sampleTitles.length] ?? 'your task'),
    is_read:    i % 3 !== 0,
    created_at: daysAgo(rand(0, 14)),
  }));
  await sb.from('notifications').insert(notifRows);
  console.log(`  ✅ ${notifRows.length} notifications`);

  // ── Subscription ──────────────────────────────────────────────────────────
  console.log('\n[5] Setting subscription (pro)…');
  const planStart = new Date();
  planStart.setDate(planStart.getDate() - rand(30, 180));
  await sb.from('subscriptions').delete().eq('user_id', USER_ID);
  await sb.from('subscriptions').insert({
    user_id:        USER_ID,
    plan_type:      'pro',
    status:         'active',
    started_at:     planStart.toISOString(),
    expires_at:     new Date(planStart.getTime() + 365*24*60*60*1000).toISOString(),
    billing_period: 'annual',
    renewal_date:   new Date(planStart.getTime() + 365*24*60*60*1000).toISOString(),
  });
  console.log('  ✅ pro subscription');

  // ── User settings ─────────────────────────────────────────────────────────
  console.log('\n[6] Updating user settings…');
  await sb.from('user_settings').upsert({
    user_id:                   USER_ID,
    daily_goal_hours:          6,
    default_estimate_minutes:  45,
    notifications: { taskReminders: true, timeGapAlerts: true, weeklySummary: true, soundEffects: true, focusEndAlert: true },
    focus:         { autoStartBreak: false, showGapLive: true, confirmFinish: true },
    privacy:       { publicProfile: false, shareStats: false },
  }, { onConflict: 'user_id' });
  console.log('  ✅ settings updated');

  console.log('\n' + '━'.repeat(50));
  console.log('🎉  Done!\n');
  console.log(`  Tasks:          ${taskCount}`);
  console.log(`  Time logs:      ${logCount}`);
  console.log(`  Break logs:     ${breakCount}`);
  console.log(`  Notifications:  ${notifRows.length}`);
  console.log('\n  Open the app and explore every page — data is live.\n');
}

seed().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
