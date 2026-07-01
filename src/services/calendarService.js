const GCAL_BASE = 'https://www.googleapis.com/calendar/v3';

/**
 * Fetch the user's primary calendar events for the next 30 days.
 *
 * @param {string} accessToken  Google OAuth access token from session.provider_token
 * @returns {{ data: Array|null, error: string|null }}
 *   error === 'expired'  → token is no longer valid; show Reconnect UI
 *   error === null       → success
 */
export async function fetchUpcomingEvents(accessToken) {
  const now    = new Date();
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    timeMin:      now.toISOString(),
    timeMax:      future.toISOString(),
    singleEvents: 'true',
    orderBy:      'startTime',
    maxResults:   '20',
  });

  let res;
  try {
    res = await fetch(`${GCAL_BASE}/calendars/primary/events?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    return { data: null, error: 'network' };
  }

  if (res.status === 401 || res.status === 403) return { data: null, error: 'expired' };
  if (!res.ok) return { data: null, error: `api_${res.status}` };

  const json = await res.json();
  return { data: json.items ?? [], error: null };
}
