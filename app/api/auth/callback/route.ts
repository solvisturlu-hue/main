import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { setTokenCookies } from '@/lib/cookies';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: {
    id: number;
    firstname: string;
    lastname: string;
  };
  errors?: Array<{ resource: string; field: string; code: string }>;
  message?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/?error=access_denied', request.url));
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/?error=config_error', request.url));
  }

  try {
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
    }

    const tokenData: TokenResponse = await tokenResponse.json();

    if (tokenData.errors || tokenData.message) {
      throw new Error(tokenData.message || 'Token exchange error');
    }

    const cookieStore = cookies();
    setTokenCookies(cookieStore, {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
    });

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
