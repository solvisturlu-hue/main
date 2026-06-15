import { NextRequest, NextResponse } from 'next/server';

// Setup page: user visits this to do Strava OAuth once and get their refresh token
// stored as STRAVA_REFRESH_TOKEN env var in Vercel
export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Step 2: exchange code for tokens
  if (code) {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

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

    const tokenData = await tokenResponse.json();

    if (tokenData.errors || !tokenData.refresh_token) {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;max-width:600px;margin:60px auto;padding:20px">
          <h2 style="color:red">Auth failed</h2>
          <pre>${JSON.stringify(tokenData, null, 2)}</pre>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const athlete = tokenData.athlete;

    return new NextResponse(
      `<html><body style="font-family:sans-serif;max-width:600px;margin:60px auto;padding:20px;background:#0a0a1a;color:#e0e0f0">
        <h1 style="color:#FC4C02">✓ Connected to Strava!</h1>
        <p>Welcome, <strong>${athlete?.firstname} ${athlete?.lastname}</strong></p>
        <hr style="border-color:#333;margin:24px 0">
        <h2>Add this to Vercel Environment Variables</h2>
        <p style="color:#aaa">Go to Vercel → your project → Settings → Environment Variables and add:</p>
        <div style="background:#111;border:1px solid #333;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0;font-family:monospace;font-size:14px">
            <strong style="color:#FC4C02">STRAVA_REFRESH_TOKEN</strong><br>
            <span style="color:#4CAF50;word-break:break-all">${tokenData.refresh_token}</span>
          </p>
        </div>
        <p style="color:#aaa">After adding it, redeploy your Vercel project. Then connect the MCP server in Claude.ai.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  if (error) {
    return new NextResponse(`<html><body>Error: ${error}</body></html>`, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Step 1: redirect to Strava OAuth
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const clientId = process.env.STRAVA_CLIENT_ID;

  const stravaUrl = new URL('https://www.strava.com/oauth/authorize');
  stravaUrl.searchParams.set('client_id', clientId!);
  stravaUrl.searchParams.set('redirect_uri', `${appUrl}/api/setup`);
  stravaUrl.searchParams.set('response_type', 'code');
  stravaUrl.searchParams.set('scope', 'activity:read_all,read');

  return NextResponse.redirect(stravaUrl.toString());
}
