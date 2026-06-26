#!/usr/bin/env node
/**
 * seed-demo.js — StartSmart demo data seeder
 *
 * Creates 5 realistic demo personas and populates every application table
 * with production-quality data.
 *
 * Requirements:
 *   VITE_SUPABASE_URL          — in .env (same as app)
 *   SUPABASE_SERVICE_ROLE_KEY  — add this line to .env (never committed)
 *
 * Usage:
 *   npm run seed:demo           — wipe demo data, recreate everything
 *   npm run seed:demo -- --dry  — print what would be created, no DB writes
 *
 * To get SUPABASE_SERVICE_ROLE_KEY:
 *   Supabase dashboard → your project → Settings → API → service_role (secret)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  PERSONAS, TASK_TEMPLATES, TAG_PALETTE, REFLECTIONS,
  NOTIFICATION_TEMPLATES, SETTINGS_BY_PLAN,
} from './seed-data.js';

// ── Config ────────────────────────────────────────────────────────────────────

const __dir  = dirname(fileURLToPath(import.meta.url));
const envRaw = readFileSync(join(__dir, '../.env'), 'utf8');
const env    = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const SUPABASE_URL      = env['VITE_SUPABASE_URL'];
const SERVICE_ROLE_KEY  = env['SUPABASE_SERVICE_ROLE_KEY'];
const DRY_RUN           = process.argv.includes('--dry');
const DEMO_EMAIL_SUFFIX = '@startsmart.app';

if (!SUPABASE_URL) {
  console.error('❌  VITE_SUPABASE_URL missing from .env');
  process.exit(1);
}
if (!SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY missing from .env');
  console.error('   Add it: Supabase dashboard → your project → Settings → API → service_role');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(...args)  { console.log(...args); }
function ok(msg)       { console.log('  ✅', msg); }
function info(msg)     { console.log('    ', msg); }
function fail(msg)     { console.error('  ❌', msg); }

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr)      { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr)   { return [...arr].sort(() => Math.random() - 0.5); }

/** ISO date string for N days ago/forward relative to today */
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
function dateOnly(iso) { return iso.slice(0, 10); }

function randomReflection() { return pick(REFLECTIONS); }

/** Build a realistic time log for a completed task */
function makeTimeLog(taskId, userId, scheduledIso, estimatedMinutes) {
  const started = new Date(scheduledIso);
  started.setHours(rand(8, 16), rand(0, 30), 0, 0);

  // Gap: ±30% variance, biased slightly long
  const gapMinutes = rand(-Math.floor(estimatedMinutes * 0.3), Math.floor(estimatedMinutes * 0.5));
  const actual     = Math.max(5, estimatedMinutes + gapMinutes);

  const ended = new Date(started.getTime() + actual * 60 * 1000);

  return {
    task_id:            taskId,
    user_id:            userId,
    started_at:         started.toISOString(),
    ended_at:           ended.toISOString(),
    estimated_duration: estimatedMinutes,
    actual_duration:    actual,
    gap:                actual - estimatedMinutes,
  };
}

/** Optionally add a break log for a time log */
function makeBreakLog(timeLogId, taskId, userId, startedAt, endedAt) {
  const sessionStart = new Date(startedAt);
  const sessionEnd   = new Date(endedAt);
  const sessionLen   = (sessionEnd - sessionStart) / 60000; // minutes

  if (sessionLen < 30) return null; // too short for a break

  const breakStart = new Date(sessionStart.getTime() + rand(20, Math.floor(sessionLen * 0.6)) * 60000);
  const breakMins  = rand(5, 20);
  const breakEnd   = new Date(breakStart.getTime() + breakMins * 60000);

  if (breakEnd >= sessionEnd) return null;

  return {
    time_log_id:    timeLogId,
    task_id:        taskId,
    user_id:        userId,
    stopped_at:     breakStart.toISOString(),
    resumed_at:     breakEnd.toISOString(),
    break_duration: breakMins,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  log('\n🌱  StartSmart Demo Seeder');
  log('━'.repeat(50));
  if (DRY_RUN) log('⚠️  DRY RUN — no writes\n');

  // ── Step 1: wipe existing demo users ──────────────────────────────────────
  log('\n[1] Removing existing demo data…');
  const demoEmails = PERSONAS.map(p => p.email);
  const { data: existingUsers } = await sb.auth.admin.listUsers();
  const toDelete = (existingUsers?.users ?? []).filter(u => u.email?.endsWith(DEMO_EMAIL_SUFFIX));

  for (const u of toDelete) {
    if (!DRY_RUN) {
      // Cascade: tasks, tags, time_logs, etc. will be deleted via FK cascade
      await sb.auth.admin.deleteUser(u.id);
    }
    info(`removed ${u.email} (${u.id})`);
  }
  ok(`Cleaned ${toDelete.length} previous demo user(s)`);

  let totalTasks = 0, totalTimeLogs = 0, totalBreaks = 0, totalNotifs = 0;
  const createdUsers = [];

  // ── Step 2: create each persona ───────────────────────────────────────────
  for (const persona of PERSONAS) {
    log(`\n[USER] ${persona.first_name} ${persona.last_name} <${persona.email}>`);

    // 2a. Create auth user (bypasses email confirmation, no rate limit)
    let userId;
    if (!DRY_RUN) {
      const { data: authData, error: authErr } = await sb.auth.admin.createUser({
        email:              persona.email,
        password:           persona.password,
        email_confirm:      true,
        user_metadata: {
          first_name: persona.first_name,
          last_name:  persona.last_name,
          username:   persona.username,
          phone:      persona.phone,
        },
      });
      if (authErr) { fail(`auth.createUser: ${authErr.message}`); continue; }
      userId = authData.user.id;
      ok(`Auth user created: ${userId}`);

      // Wait for on_auth_user_created trigger (profiles + user_settings)
      await new Promise(r => setTimeout(r, 600));
    } else {
      userId = `dry-run-${persona.username}`;
    }
    createdUsers.push({ ...persona, id: userId });

    // 2b. Update profile (triggers created the row; we enrich it)
    if (!DRY_RUN) {
      const { error: profErr } = await sb.from('profiles').update({
        first_name:             persona.first_name,
        last_name:              persona.last_name,
        username:               persona.username,
        phone:                  persona.phone,
        bio:                    persona.bio,
        language:               persona.language,
        theme:                  persona.theme,
        timezone:               persona.timezone,
        avatar_color:           persona.avatar_color,
        notifications_enabled:  true,
      }).eq('id', userId);
      if (profErr) fail(`profile update: ${profErr.message}`);
      else ok('Profile enriched');
    }

    // 2c. User settings
    const settingsDefaults = SETTINGS_BY_PLAN[persona.plan] ?? SETTINGS_BY_PLAN.free;
    if (!DRY_RUN) {
      await sb.from('user_settings').upsert({
        user_id:                   userId,
        daily_goal_hours:          settingsDefaults.daily_goal_hours,
        default_estimate_minutes:  settingsDefaults.default_estimate_minutes,
        notifications: { taskReminders: true, timeGapAlerts: true, weeklySummary: persona.plan !== 'free', soundEffects: true, focusEndAlert: true },
        focus:         { autoStartBreak: false, showGapLive: true, confirmFinish: persona.plan === 'premium' },
        privacy:       { publicProfile: persona.plan === 'premium', shareStats: false },
      }, { onConflict: 'user_id' });
      ok('User settings written');
    }

    // 2d. Subscription
    const planStart = new Date();
    planStart.setDate(planStart.getDate() - rand(30, 365));
    if (!DRY_RUN) {
      await sb.from('subscriptions').insert({
        user_id:        userId,
        plan_type:      persona.plan,
        status:         'active',
        started_at:     planStart.toISOString(),
        expires_at:     persona.plan !== 'free' ? new Date(planStart.getTime() + 365*24*60*60*1000).toISOString() : null,
        billing_period: persona.plan !== 'free' ? 'annual' : null,
        renewal_date:   persona.plan !== 'free' ? new Date(planStart.getTime() + 365*24*60*60*1000).toISOString() : null,
      });
      ok(`Subscription: ${persona.plan}`);
    }

    // 2e. Tags
    const tagMap = {}; // tag name → tag id
    if (!DRY_RUN) {
      for (const tagName of persona.tags) {
        const preset = TAG_PALETTE.find(t => t.name === tagName) ?? { color: '#6b38d4' };
        const { data: tagRow, error: tagErr } = await sb.from('tags')
          .upsert({ user_id: userId, tag_name: tagName, color: preset.color }, { onConflict: 'user_id,tag_name' })
          .select('id').single();
        if (!tagErr && tagRow) tagMap[tagName] = tagRow.id;
      }
      ok(`Tags created: ${Object.keys(tagMap).length}`);
    }

    // 2f. Tasks
    const templates = TASK_TEMPLATES[persona.task_mix];
    const allTasks  = [
      ...templates.completed.map(t => ({ ...t, status: 'done' })),
      ...templates.in_progress.map(t => ({ ...t, status: 'in_progress' })),
      ...templates.pending.map(t => ({ ...t, status: 'pending' })),
    ];

    let userTaskCount = 0, userLogCount = 0, userBreakCount = 0;

    for (let i = 0; i < allTasks.length; i++) {
      const t = allTasks[i];
      const isComplete   = t.status === 'done';
      const isInProgress = t.status === 'in_progress';

      // Spread completed tasks over last 25 days; in-progress over last 3 days
      let scheduledIso;
      if (isComplete) {
        scheduledIso = daysAgo(rand(1, 25));
      } else if (isInProgress) {
        scheduledIso = daysAgo(rand(0, 3));
      } else {
        // Pending: mix of today, tomorrow, this week, future
        const offset = pick([0, 1, 2, 3, 5, 7, 10, 14]);
        scheduledIso = daysAhead(offset);
      }

      const reflection = isComplete && Math.random() > 0.35 ? randomReflection() : null;

      if (!DRY_RUN) {
        const { data: taskRow, error: taskErr } = await sb.from('tasks').insert({
          user_id:            userId,
          title:              t.title,
          description:        t.desc,
          estimated_duration: t.est,
          scheduled_date:     dateOnly(scheduledIso),
          task_status:        t.status,
          priority_high:      t.hi,
          completed_at:       isComplete ? scheduledIso : null,
          reflection:         reflection,
        }).select('id').single();

        if (taskErr) { fail(`task insert: ${taskErr.message} — ${t.title}`); continue; }
        const taskId = taskRow.id;
        userTaskCount++;
        totalTasks++;

        // Tag associations
        const taskTagIds = (t.tags ?? [])
          .map(n => tagMap[n])
          .filter(Boolean);
        if (taskTagIds.length > 0) {
          await sb.from('task_tags').insert(
            taskTagIds.map(tagId => ({ task_id: taskId, tag_id: tagId }))
          );
        }

        // Time log for completed tasks
        if (isComplete) {
          const logData = makeTimeLog(taskId, userId, scheduledIso, t.est);
          const { data: logRow, error: logErr } = await sb.from('time_logs')
            .insert(logData).select('id').single();

          if (!logErr && logRow) {
            userLogCount++;
            totalTimeLogs++;

            // ~40% of sessions have a break
            if (Math.random() < 0.4) {
              const brk = makeBreakLog(logRow.id, taskId, userId, logData.started_at, logData.ended_at);
              if (brk) {
                await sb.from('break_logs').insert(brk);
                userBreakCount++;
                totalBreaks++;
              }
            }
          }
        }
      } else {
        userTaskCount++;
      }
    }
    ok(`Tasks: ${userTaskCount} (${templates.completed.length} done, ${templates.in_progress.length} in-progress, ${templates.pending.length} pending)`);
    if (!DRY_RUN) ok(`Time logs: ${userLogCount} | Break logs: ${userBreakCount}`);

    // 2g. Notifications
    if (!DRY_RUN) {
      const pendingTaskTitles = templates.pending.slice(0, 3).map(t => t.title);
      const notifRows = NOTIFICATION_TEMPLATES.map((tmpl, i) => ({
        user_id:    userId,
        type:       tmpl.type,
        title:      tmpl.title,
        message:    tmpl.body.replace('{title}', pendingTaskTitles[i % pendingTaskTitles.length] ?? 'your task'),
        is_read:    i % 3 !== 0, // every 3rd notification is unread
        created_at: daysAgo(rand(0, 14)),
      }));
      await sb.from('notifications').insert(notifRows);
      totalNotifs += notifRows.length;
      ok(`Notifications: ${notifRows.length}`);
    }
  } // end persona loop

  // ── Summary ───────────────────────────────────────────────────────────────
  log('\n' + '━'.repeat(50));
  log('🎉  Seeding complete!\n');
  log(`  Demo users:     ${createdUsers.length}`);
  log(`  Total tasks:    ${totalTasks}`);
  log(`  Time logs:      ${totalTimeLogs}`);
  log(`  Break logs:     ${totalBreaks}`);
  log(`  Notifications:  ${totalNotifs}`);
  log('\n  Demo credentials (all users):');
  for (const u of createdUsers) {
    log(`    ${u.email}  /  ${u.password}`);
  }
  log('\n  To reseed at any time:');
  log('    npm run seed:demo\n');
}

seed().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
