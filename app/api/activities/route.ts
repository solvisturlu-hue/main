import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getValidToken, fetchAllRuns, StravaAthlete } from '@/lib/strava';
import { analyzeActivities } from '@/lib/analysis';

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = cookies();
    const accessToken = await getValidToken(cookieStore);

    // Fetch athlete info
    const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    let athlete: StravaAthlete | null = null;
    if (athleteResponse.ok) {
      athlete = await athleteResponse.json();
    }

    // Fetch all runs
    const runs = await fetchAllRuns(accessToken);

    // Analyze activities
    const stats = analyzeActivities(runs, athlete);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Activities fetch error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch activities';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
