import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!clientId) {
    return NextResponse.json({ error: 'Strava client ID not configured' }, { status: 500 });
  }

  const redirectUri = `${appUrl}/api/auth/callback`;
  const scope = 'activity:read_all,read';

  const stravaAuthUrl = new URL('https://www.strava.com/oauth/authorize');
  stravaAuthUrl.searchParams.set('client_id', clientId);
  stravaAuthUrl.searchParams.set('redirect_uri', redirectUri);
  stravaAuthUrl.searchParams.set('response_type', 'code');
  stravaAuthUrl.searchParams.set('scope', scope);

  return NextResponse.redirect(stravaAuthUrl.toString());
}
