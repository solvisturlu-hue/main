export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export function setTokenCookies(
  cookies: { set: (name: string, value: string, options: object) => void },
  tokenData: TokenData
): void {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
  };

  cookies.set('strava_access_token', tokenData.access_token, {
    ...cookieOptions,
    maxAge: tokenData.expires_at - Math.floor(Date.now() / 1000),
  });

  cookies.set('strava_refresh_token', tokenData.refresh_token, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  cookies.set('strava_expires_at', String(tokenData.expires_at), {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}
