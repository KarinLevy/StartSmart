/**
 * userService.js
 * Centralized API functions for user/account management.
 *
 * All functions return { data, error }.
 * When DEV_MODE is true they simulate network delay and return mock success
 * so the UI can be tested without a real backend.
 *
 * Replace DEV_MODE with `false` (or remove the flag) once the backend is live.
 *
 * Base URL is read from VITE_API_URL env var (set in .env).
 * Example: VITE_API_URL=https://api.startsmart.app
 */

const DEV_MODE = true; // TODO: remove when backend is ready
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const authHeaders = () => ({
  'Content-Type': 'application/json',
  // Backend integration point: replace with real token from AuthContext
  Authorization: `Bearer ${localStorage.getItem('ss_token') ?? ''}`,
});

async function request(method, path, body) {
  if (DEV_MODE) {
    await delay(800);
    return { data: { ok: true }, error: null };
  }
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { data: null, error: json.message ?? `HTTP ${res.status}` };
    return { data: json, error: null };
  } catch (err) {
    return { data: null, error: 'Network error. Please try again.' };
  }
}

/**
 * GET /api/user/me
 * Fetch the current authenticated user's profile.
 */
export async function fetchCurrentUser() {
  return request('GET', '/api/user/me');
}

/**
 * PATCH /api/user/profile
 * Update editable profile fields.
 * @param {{ firstName, lastName, username, email, phone, bio }} fields
 */
export async function updateProfile(fields) {
  return request('PATCH', '/api/user/profile', fields);
}

/**
 * POST /api/user/avatar
 * Upload a new avatar image.
 * Accepts a File object; sends as multipart/form-data.
 * @param {File} file
 */
export async function uploadAvatar(file) {
  if (DEV_MODE) {
    await delay(1000);
    return { data: { avatarUrl: URL.createObjectURL(file) }, error: null };
  }
  try {
    const form = new FormData();
    form.append('avatar', file);
    const res = await fetch(`${BASE_URL}/api/user/avatar`, {
      method: 'POST',
      headers: { Authorization: authHeaders().Authorization },
      body: form,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { data: null, error: json.message ?? `HTTP ${res.status}` };
    return { data: json, error: null }; // expects { avatarUrl: string }
  } catch (err) {
    return { data: null, error: 'Upload failed. Please try again.' };
  }
}

/**
 * PATCH /api/user/password
 * Change account password.
 * @param {{ currentPassword, newPassword }} payload
 */
export async function changePassword(payload) {
  return request('PATCH', '/api/user/password', payload);
}

/**
 * DELETE /api/user/account
 * Permanently delete the authenticated user's account.
 * @param {{ confirmationText }} payload — the user's typed confirmation
 */
export async function deleteAccount(payload) {
  return request('DELETE', '/api/user/account', payload);
}
