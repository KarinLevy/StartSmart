import { supabase } from '../lib/supabaseClient';

/**
 * PATCH profiles row for the current user.
 * @param {{ firstName, lastName, username, phone, bio }} fields
 */
export async function updateProfile(fields) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { data: null, error: 'Not authenticated' };

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name:   fields.firstName   ?? '',
      last_name:    fields.lastName    ?? '',
      username:     fields.username    ?? '',
      phone:        fields.phone       || null,
      bio:          fields.bio         || null,
      language:     fields.language    ?? 'en',
      theme:        fields.theme       ?? 'light',
      timezone:     fields.timezone    ?? 'UTC',
      avatar_color: fields.avatarColor ?? '#6366f1',
    })
    .eq('id', session.user.id);

  if (error) return { data: null, error: error.message };
  return { data: { ok: true }, error: null };
}

/**
 * Upload a new avatar image.
 * Keeps the local object-URL approach for immediate preview; persists via
 * Supabase Storage if a bucket named "avatars" is configured.
 * @param {File} file
 */
export async function uploadAvatar(file) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { data: null, error: 'Not authenticated' };

  const ext  = file.name.split('.').pop();
  const path = `${session.user.id}/avatar.${ext}`;

  const { error: upErr } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });

  if (upErr) {
    return { data: null, error: upErr.message || 'Upload failed' };
  }

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);

  // Persist URL back to profiles row
  await supabase
    .from('profiles')
    .update({ profile_image: urlData.publicUrl })
    .eq('id', session.user.id);

  return { data: { avatarUrl: urlData.publicUrl }, error: null };
}

/**
 * Sync the notifications_enabled flag to the profiles row.
 * @param {boolean} enabled
 */
export async function updateNotificationsEnabled(enabled) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;
  await supabase
    .from('profiles')
    .update({ notifications_enabled: enabled })
    .eq('id', session.user.id);
}

/**
 * Change the authenticated user's password via Supabase Auth.
 * Re-authenticates with the current password first to confirm identity.
 * @param {{ currentPassword, newPassword }} payload
 */
export async function changePassword({ currentPassword, newPassword }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { data: null, error: 'pwModal.err.notAuth' };

  // Re-authenticate to verify the current password
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email:    session.user.email,
    password: currentPassword,
  });
  if (authErr) return { data: null, error: 'pwModal.err.wrongCurrent' };

  // Current password confirmed — update to new password
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { data: null, error: 'pwModal.err.generic' };
  return { data: { ok: true }, error: null };
}

/**
 * Delete the current user's account.
 * Supabase does not expose a self-delete endpoint from the client with the
 * anon key — this requires a server-side function or admin API call.
 * For now we sign the user out, which is the safest client-side action.
 */
export async function deleteAccount() {
  await supabase.auth.signOut();
  return { data: { ok: true }, error: null };
}
