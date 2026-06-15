import Anthropic from '@anthropic-ai/sdk';
import { TrainingStats } from '@/lib/analysis';

export const runtime = 'edge';

interface CoachRequest {
  raceDistance: string;
  raceDate: string;
  stats: TrainingStats;
}

function getWeeksUntilRace(raceDateStr: string): number {
  const raceDate = new Date(raceDateStr);
  const now = new Date();
  const diffMs = raceDate.getTime() - now.getTime();
  return Math.max(0, Math.round(diffMs / (7 * 24 * 60 * 60 * 1000)));
}

function formatPaceByDistance(paceByDistance: TrainingStats['paceByDistance']): string {
  const entries = Object.entries(paceByDistance)
    .filter(([, pace]) => pace !== null)
    .map(([dist, pace]) => `${dist}: ${pace} min/km`);

  return entries.length > 0 ? entries.join(', ') : 'No race-specific pace data available';
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: CoachRequest = await request.json();
    const { raceDistance, raceDate, stats } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response('Anthropic API key not configured', { status: 500 });
    }

    const client = new Anthropic({ apiKey });
    const weeksUntilRace = getWeeksUntilRace(raceDate);
    const paceStr = formatPaceByDistance(stats.paceByDistance);

    const prompt = `You are an elite running coach with 20+ years experience. Analyze this athlete's data and give coaching advice for their goal race.

TRAINING DATA:
- Total runs analyzed: ${stats.totalRuns}
- Avg weekly mileage (last 12 weeks): ${stats.avgWeeklyMiles} miles
- Recent 4-week load: ${stats.recentLoad} miles
- Longest run: ${stats.longestRun} miles
- Training consistency: ${stats.consistency}% of weeks active
- Estimated paces: ${paceStr}

GOAL RACE: ${raceDistance} on ${raceDate} (${weeksUntilRace} weeks away)

Give a thorough coaching response with these sections:
## Current Fitness Assessment
## Race Readiness
## Predicted Finish Time
## Key Training Recommendations (next 4-6 weeks)
## Biggest Risk Factor to Watch

Be specific, data-driven, and encouraging. Use the actual numbers from their data.`;

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Coach API error:', error);
    return new Response('Failed to get coaching response', { status: 500 });
  }
}
