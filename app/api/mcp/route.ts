import { NextRequest, NextResponse } from 'next/server';
import { analyzeActivities } from '@/lib/analysis';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function getAccessToken(): Promise<string> {
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!refreshToken) throw new Error('STRAVA_REFRESH_TOKEN not configured. Visit /api/setup first.');
  if (!clientId || !clientSecret) throw new Error('Strava credentials not configured.');

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) throw new Error('Failed to refresh Strava token');
  const data = await res.json();
  return data.access_token;
}

async function fetchActivities(accessToken: string, perPage = 200, page = 1) {
  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Strava API error: ${res.statusText}`);
  return res.json();
}

async function fetchAllRuns(accessToken: string) {
  const all: any[] = [];
  let page = 1;
  while (true) {
    const batch = await fetchActivities(accessToken, 200, page);
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch.filter((a: any) => a.type === 'Run' || a.sport_type === 'Run'));
    if (batch.length < 200) break;
    page++;
  }
  return all;
}

async function fetchAthlete(accessToken: string) {
  const res = await fetch('https://www.strava.com/api/v3/athlete', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch athlete');
  return res.json();
}

const TOOLS = [
  {
    name: 'get_athlete',
    description: 'Get the Strava athlete profile (name, location, stats)',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_recent_runs',
    description: 'Get the most recent runs from Strava with distance, pace, date and name',
    inputSchema: {
      type: 'object',
      properties: {
        count: { type: 'number', description: 'Number of recent runs to fetch (default 10, max 50)' },
      },
      required: [],
    },
  },
  {
    name: 'analyze_training',
    description: 'Analyze all historical Strava running data: weekly volume, consistency, longest run, pace by distance. Use this for coaching advice.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_activity_stats',
    description: 'Get Strava athlete stats (total distance, runs, elevation etc.)',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
];

async function callTool(name: string, args: any): Promise<string> {
  const token = await getAccessToken();

  if (name === 'get_athlete') {
    const athlete = await fetchAthlete(token);
    return JSON.stringify({
      name: `${athlete.firstname} ${athlete.lastname}`,
      city: athlete.city,
      country: athlete.country,
      profile: athlete.profile_medium,
      followers: athlete.follower_count,
      following: athlete.friend_count,
    }, null, 2);
  }

  if (name === 'get_recent_runs') {
    const count = Math.min(args?.count ?? 10, 50);
    const activities = await fetchActivities(token, count, 1);
    const runs = activities
      .filter((a: any) => a.type === 'Run' || a.sport_type === 'Run')
      .slice(0, count)
      .map((a: any) => ({
        name: a.name,
        date: new Date(a.start_date_local).toLocaleDateString('en-GB'),
        distance_km: Math.round(a.distance / 100) / 10,
        duration_min: Math.round(a.moving_time / 60),
        pace_per_km: formatPace(a.moving_time / a.distance * 1000),
        elevation_m: Math.round(a.total_elevation_gain),
      }));
    return JSON.stringify(runs, null, 2);
  }

  if (name === 'analyze_training') {
    const runs = await fetchAllRuns(token);
    const athlete = await fetchAthlete(token);
    const stats = analyzeActivities(runs, athlete);
    return JSON.stringify({
      total_runs: stats.totalRuns,
      avg_weekly_km: stats.avgWeeklyKm,
      recent_4wk_load_km: stats.recentLoad,
      longest_run_km: stats.longestRun,
      consistency_pct: stats.consistency,
      pace_by_distance: stats.paceByDistance,
      recent_runs: stats.recentRuns,
      athlete: stats.athlete,
    }, null, 2);
  }

  if (name === 'get_activity_stats') {
    const athlete = await fetchAthlete(token);
    const res = await fetch(`https://www.strava.com/api/v3/athletes/${athlete.id}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const stats = await res.json();
    return JSON.stringify({
      all_time_runs: stats.all_run_totals?.count,
      all_time_distance_km: Math.round(stats.all_run_totals?.distance / 100) / 10,
      all_time_elevation_m: stats.all_run_totals?.elevation_gain,
      ytd_runs: stats.ytd_run_totals?.count,
      ytd_distance_km: Math.round(stats.ytd_run_totals?.distance / 100) / 10,
    }, null, 2);
  }

  throw new Error(`Unknown tool: ${name}`);
}

function formatPace(secPerKm: number): string {
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, '0')} /km`;
}

function jsonrpc(id: any, result: any) {
  return NextResponse.json({ jsonrpc: '2.0', id, result });
}

function jsonrpcError(id: any, code: number, message: string) {
  return NextResponse.json({ jsonrpc: '2.0', id, error: { code, message } });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonrpcError(null, -32700, 'Parse error');
  }

  const { id, method, params } = body;

  try {
    if (method === 'initialize') {
      return jsonrpc(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'strava-coach', version: '1.0.0' },
      });
    }

    if (method === 'tools/list') {
      return jsonrpc(id, { tools: TOOLS });
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params;
      try {
        const result = await callTool(name, args);
        return jsonrpc(id, {
          content: [{ type: 'text', text: result }],
        });
      } catch (err: any) {
        return jsonrpc(id, {
          content: [{ type: 'text', text: `Error: ${err.message}` }],
          isError: true,
        });
      }
    }

    if (method === 'notifications/initialized') {
      return new NextResponse(null, { status: 204 });
    }

    return jsonrpcError(id, -32601, `Method not found: ${method}`);
  } catch (err: any) {
    return jsonrpcError(id, -32603, err.message);
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'strava-coach',
    description: 'MCP server for Strava running data and coaching',
    version: '1.0.0',
  });
}
