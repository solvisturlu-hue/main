import { StravaActivity, StravaAthlete } from './strava';

export interface PaceByDistance {
  '5K': string | null;
  '10K': string | null;
  'Half Marathon': string | null;
  'Marathon': string | null;
}

export interface RecentRun {
  name: string;
  distance: number;
  date: string;
  pace: string;
}

export interface TrainingStats {
  totalRuns: number;
  avgWeeklyKm: number;
  recentLoad: number;
  longestRun: number;
  consistency: number;
  paceByDistance: PaceByDistance;
  recentRuns: RecentRun[];
  athlete: { firstname: string; lastname: string; profile: string } | null;
}

function metersToKm(meters: number): number {
  return meters / 1000;
}

function formatPace(secondsPerKm: number): string {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getPaceForActivity(activity: StravaActivity): string {
  if (activity.distance === 0) return '0:00';
  const secondsPerKm = (activity.moving_time / activity.distance) * 1000;
  return formatPace(secondsPerKm);
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export function analyzeActivities(
  activities: StravaActivity[],
  athlete?: StravaAthlete | null
): TrainingStats {
  if (activities.length === 0) {
    return {
      totalRuns: 0,
      avgWeeklyKm: 0,
      recentLoad: 0,
      longestRun: 0,
      consistency: 0,
      paceByDistance: { '5K': null, '10K': null, 'Half Marathon': null, 'Marathon': null },
      recentRuns: [],
      athlete: athlete
        ? { firstname: athlete.firstname, lastname: athlete.lastname, profile: athlete.profile }
        : null,
    };
  }

  const now = new Date();
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
  const fourWeeksAgo = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);

  // Last 12 weeks activities
  const last12Weeks = activities.filter(
    (a) => new Date(a.start_date) >= twelveWeeksAgo
  );

  // Last 4 weeks activities
  const last4Weeks = activities.filter(
    (a) => new Date(a.start_date) >= fourWeeksAgo
  );

  // Average weekly km (last 12 weeks)
  const totalKmLast12 = last12Weeks.reduce(
    (sum, a) => sum + metersToKm(a.distance),
    0
  );
  const avgWeeklyKm = Math.round((totalKmLast12 / 12) * 10) / 10;

  // Recent load (last 4 weeks total km)
  const recentLoad = Math.round(
    last4Weeks.reduce((sum, a) => sum + metersToKm(a.distance), 0) * 10
  ) / 10;

  // Longest run ever (in km)
  const longestRun =
    Math.round(
      Math.max(...activities.map((a) => metersToKm(a.distance))) * 10
    ) / 10;

  // Consistency: % of last 12 weeks that had at least one run
  const weeksWithRuns = new Set(
    last12Weeks.map((a) => getWeekStart(new Date(a.start_date)))
  );
  const consistency = Math.round((weeksWithRuns.size / 12) * 100);

  // Pace by distance
  const distances = {
    '5K': 5000,
    '10K': 10000,
    'Half Marathon': 21097,
    'Marathon': 42195,
  } as const;

  const paceByDistance: PaceByDistance = {
    '5K': null,
    '10K': null,
    'Half Marathon': null,
    'Marathon': null,
  };

  for (const [label, targetMeters] of Object.entries(distances) as [keyof PaceByDistance, number][]) {
    const tolerance = 0.15;
    const minDist = targetMeters * (1 - tolerance);
    const maxDist = targetMeters * (1 + tolerance);

    const matchingRuns = activities.filter(
      (a) => a.distance >= minDist && a.distance <= maxDist && a.moving_time > 0
    );

    if (matchingRuns.length > 0) {
      const avgSecPerKm =
        matchingRuns.reduce(
          (sum, a) => sum + (a.moving_time / a.distance) * 1000,
          0
        ) / matchingRuns.length;
      paceByDistance[label] = formatPace(avgSecPerKm);
    }
  }

  // Recent runs (last 5)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  const recentRuns: RecentRun[] = sortedActivities.slice(0, 5).map((a) => ({
    name: a.name,
    distance: Math.round(metersToKm(a.distance) * 10) / 10,
    date: new Date(a.start_date_local).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    pace: getPaceForActivity(a),
  }));

  return {
    totalRuns: activities.length,
    avgWeeklyKm,
    recentLoad,
    longestRun,
    consistency,
    paceByDistance,
    recentRuns,
    athlete: athlete
      ? { firstname: athlete.firstname, lastname: athlete.lastname, profile: athlete.profile }
      : null,
  };
}
