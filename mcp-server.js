#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

async function getAccessToken() {
  if (!REFRESH_TOKEN) throw new Error('No STRAVA_REFRESH_TOKEN found. Run: node setup.js');
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Token refresh failed: ' + JSON.stringify(data));
  return data.access_token;
}

async function stravaGet(path, token) {
  const res = await fetch(`https://www.strava.com/api/v3${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Strava API error ${res.status}: ${res.statusText}`);
  return res.json();
}

async function fetchAllRuns(token) {
  const all = [];
  let page = 1;
  while (true) {
    const batch = await stravaGet(`/athlete/activities?per_page=200&page=${page}`, token);
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch.filter(a => a.type === 'Run' || a.sport_type === 'Run'));
    if (batch.length < 200) break;
    page++;
  }
  return all;
}

function formatPace(secPerKm) {
  if (!secPerKm || !isFinite(secPerKm)) return 'N/A';
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, '0')} /km`;
}

function metersToKm(m) { return Math.round(m / 100) / 10; }

function analyzeTraining(runs) {
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;

  const last12w = runs.filter(r => now - new Date(r.start_date).getTime() < 12 * week);
  const last4w  = runs.filter(r => now - new Date(r.start_date).getTime() < 4 * week);

  const avgWeeklyKm = Math.round(last12w.reduce((s, r) => s + r.distance, 0) / 1000 / 12 * 10) / 10;
  const recentLoadKm = Math.round(last4w.reduce((s, r) => s + r.distance, 0) / 100) / 10;
  const longestKm = runs.length ? metersToKm(Math.max(...runs.map(r => r.distance))) : 0;

  const weeksWithRuns = new Set(last12w.map(r => {
    const d = new Date(r.start_date);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  }));
  const consistency = Math.round(weeksWithRuns.size / 12 * 100);

  function avgPace(minM, maxM) {
    const matching = runs.filter(r => r.distance >= minM && r.distance <= maxM && r.moving_time > 0);
    if (!matching.length) return null;
    const avg = matching.reduce((s, r) => s + r.moving_time / r.distance * 1000, 0) / matching.length;
    return formatPace(avg);
  }

  const recentRuns = [...runs]
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
    .slice(0, 10)
    .map(r => ({
      name: r.name,
      date: new Date(r.start_date_local).toLocaleDateString('en-GB'),
      distance_km: metersToKm(r.distance),
      duration_min: Math.round(r.moving_time / 60),
      pace: formatPace(r.moving_time / r.distance * 1000),
      elevation_m: Math.round(r.total_elevation_gain),
    }));

  return {
    total_runs: runs.length,
    avg_weekly_km: avgWeeklyKm,
    recent_4wk_load_km: recentLoadKm,
    longest_run_km: longestKm,
    consistency_pct: consistency,
    paces: {
      '5K':           avgPace(4250, 5750),
      '10K':          avgPace(8500, 11500),
      'Half Marathon': avgPace(17900, 24200),
      'Marathon':      avgPace(38000, 46000),
    },
    recent_runs: recentRuns,
  };
}

const server = new Server(
  { name: 'strava-coach', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_athlete',
      description: 'Get your Strava profile: name, location, follower count',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_recent_runs',
      description: 'Get your most recent runs with distance, pace, duration and elevation',
      inputSchema: {
        type: 'object',
        properties: {
          count: { type: 'number', description: 'How many runs to fetch (default 10, max 50)' },
        },
      },
    },
    {
      name: 'analyze_training',
      description: 'Analyze all your historical running data: weekly volume, consistency, pace by race distance, longest run. Use this for coaching questions.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_lifetime_stats',
      description: 'Get your all-time and year-to-date Strava running totals',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const token = await getAccessToken();

    if (name === 'get_athlete') {
      const a = await stravaGet('/athlete', token);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            name: `${a.firstname} ${a.lastname}`,
            city: a.city,
            country: a.country,
            followers: a.follower_count,
            following: a.friend_count,
          }, null, 2),
        }],
      };
    }

    if (name === 'get_recent_runs') {
      const count = Math.min(args?.count ?? 10, 50);
      const activities = await stravaGet(`/athlete/activities?per_page=${count}&page=1`, token);
      const runs = activities
        .filter(a => a.type === 'Run' || a.sport_type === 'Run')
        .map(r => ({
          name: r.name,
          date: new Date(r.start_date_local).toLocaleDateString('en-GB'),
          distance_km: metersToKm(r.distance),
          duration_min: Math.round(r.moving_time / 60),
          pace: formatPace(r.moving_time / r.distance * 1000),
          elevation_m: Math.round(r.total_elevation_gain),
        }));
      return { content: [{ type: 'text', text: JSON.stringify(runs, null, 2) }] };
    }

    if (name === 'analyze_training') {
      const runs = await fetchAllRuns(token);
      const stats = analyzeTraining(runs);
      return { content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }] };
    }

    if (name === 'get_lifetime_stats') {
      const athlete = await stravaGet('/athlete', token);
      const stats = await stravaGet(`/athletes/${athlete.id}/stats`, token);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            all_time: {
              runs: stats.all_run_totals?.count,
              distance_km: metersToKm(stats.all_run_totals?.distance),
              elevation_m: stats.all_run_totals?.elevation_gain,
            },
            this_year: {
              runs: stats.ytd_run_totals?.count,
              distance_km: metersToKm(stats.ytd_run_totals?.distance),
              elevation_m: stats.ytd_run_totals?.elevation_gain,
            },
          }, null, 2),
        }],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
server.connect(transport);
