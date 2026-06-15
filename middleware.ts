import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest): NextResponse {
  const accessToken = request.cookies.get('strava_access_token');
  const refreshToken = request.cookies.get('strava_refresh_token');

  // If no tokens at all, redirect to landing page
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
