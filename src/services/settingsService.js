/**
 * settingsService.js
 * Centralized API functions for settings, export, and support.
 *
 * DEV_MODE=true simulates network delay + success responses.
 * Set to false and configure VITE_API_URL when backend is ready.
 */

import { supabase } from '../lib/supabaseClient';

const DEV_MODE = true;
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const authHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token ?? ''}`,
  };
};

async function request(method, path, body) {
  if (DEV_MODE) {
    await delay(600);
    return { data: { ok: true }, error: null };
  }
  try {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { data: null, error: json.message ?? `HTTP ${res.status}` };
    return { data: json, error: null };
  } catch {
    return { data: null, error: 'Network error. Please try again.' };
  }
}

/**
 * PATCH /api/user/settings
 * Persist user settings to the backend.
 * @param {{ language, theme, notifications, focus, privacy }} settings
 */
export async function saveSettings(settings) {
  return request('PATCH', '/api/user/settings', settings);
}

/**
 * GET /api/user/export
 * Request a full data export. In production the backend streams the JSON file.
 * In dev mode we generate the export client-side from the provided data.
 * @param {{ profile, tasks, settings, stats }} exportData
 * @returns {Blob} downloadable JSON blob
 */
export async function exportUserData(exportData) {
  if (DEV_MODE) {
    await delay(800);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    return { data: blob, error: null };
  }
  try {
    const res = await fetch(`${BASE_URL}/api/user/export`, {
      method: 'GET',
      headers: { Authorization: (await authHeaders()).Authorization },
    });
    if (!res.ok) return { data: null, error: `HTTP ${res.status}` };
    const blob = await res.blob();
    return { data: blob, error: null };
  } catch {
    return { data: null, error: 'Export failed. Please try again.' };
  }
}

/**
 * POST /api/support/report
 * Submit a problem report.
 * @param {{ description, category, userAgent }} payload
 */
export async function reportProblem(payload) {
  return request('POST', '/api/support/report', payload);
}

/**
 * Trigger a file download in the browser.
 * @param {Blob} blob
 * @param {string} filename
 */
export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
