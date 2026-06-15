import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { setTokenCookies } from './cookies';

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
}

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile: string;
  profile_medium: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: StravaAthlete;
}

export async function getValidToken(
  cookieStore: ReadonlyRequestCookies
): Promise<string> {
  const accessToken = cookieStore.get('strava_access_token')?.value;
  const refreshToken = cookieStore.get('strava_refresh_token')?.value;
  const expiresAt = cookieStore.get('strava_expires_at')?.value;

  if (!refreshToken) {
    throw new Error('No refresh token found');
  }

  const now = Math.floor(Date.now() / 1000);
  const expiry = expiresAt ? parseInt(expiresAt, 10) : 0;

  // If token is still valid (with 5 minute buffer), return it
  if (accessToken && expiry > now + 300) {
    return accessToken;
  }

  // Refresh the token
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Strava credentials not configured');
  }

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const tokenData: TokenResponse = await response.json();

  // Note: In API routes, we can't set cookies on the read-only cookie store
  // The caller should handle updating cookies if needed
  return tokenData.access_token;
}

export async function fetchAllRuns(accessToken: string): Promise<StravaActivity[]> {
  const allActivities: StravaActivity[] = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch activities: ${response.statusText}`);
    }

    const activities: StravaActivity[] = await response.json();

    if (activities.length === 0) {
      break;
    }

    // Filter to only runs
    const runs = activities.filter(
      (a) => a.type === 'Run' || a.sport_type === 'Run'
    );
    allActivities.push(...runs);

    if (activities.length < perPage) {
      break;
    }

    page++;
  }

  return allActivities;
}
