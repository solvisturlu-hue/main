'use client';

import { useEffect, useState } from 'react';
import RaceForm from '@/components/RaceForm';
import CoachResponse from '@/components/CoachResponse';
import { TrainingStats } from '@/lib/analysis';

function StatCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div
      style={{
        backgroundColor: '#1a1a2e',
        border: '1px solid #2a2a4a',
        borderRadius: '12px',
        padding: '20px',
        flex: '1',
        minWidth: '140px',
      }}
    >
      <div style={{ color: '#a0a0b0', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ color: 'white', fontSize: '28px', fontWeight: '700', lineHeight: '1' }}>
        {value}
        {unit && <span style={{ fontSize: '14px', color: '#6a6a80', marginLeft: '4px', fontWeight: '400' }}>{unit}</span>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coachContent, setCoachContent] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch('/api/activities');
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            window.location.href = '/';
            return;
          }
          throw new Error('Failed to fetch activities');
        }
        const data: TrainingStats = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  const handleCoachSubmit = async (raceDistance: string, raceDate: string) => {
    if (!stats) return;

    setCoachLoading(true);
    setCoachContent('');
    setCoachError(null);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raceDistance, raceDate, stats }),
      });

      if (!response.ok) {
        throw new Error('Failed to get coaching response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setCoachContent((prev) => prev + text);
      }
    } catch (err) {
      setCoachError(err instanceof Error ? err.message : 'Failed to get coaching advice');
    } finally {
      setCoachLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '3px solid #2a2a4a',
            borderTopColor: '#FC4C02',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: '#a0a0b0' }}>Loading your training data...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <h2 style={{ color: 'white', margin: 0 }}>Error Loading Data</h2>
        <p style={{ color: '#a0a0b0' }}>{error}</p>
        <a
          href="/"
          style={{
            backgroundColor: '#FC4C02',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          Go Back Home
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '0',
        background: 'linear-gradient(180deg, #0d0d1a 0%, #0a0a15 100%)',
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid #1e1e35',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(13, 13, 26, 0.95)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🏃</span>
          <span style={{ fontWeight: '700', fontSize: '16px', color: 'white' }}>
            Strava Running Coach
          </span>
        </div>
        {stats?.athlete && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {stats.athlete.profile && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={stats.athlete.profile}
                alt={`${stats.athlete.firstname} ${stats.athlete.lastname}`}
                width={36}
                height={36}
                style={{ borderRadius: '50%', border: '2px solid #FC4C02' }}
              />
            )}
            <span style={{ color: '#d0d0e0', fontSize: '14px' }}>
              {stats.athlete.firstname} {stats.athlete.lastname}
            </span>
          </div>
        )}
      </header>

      {/* Main content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Stats Overview */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              margin: '0 0 24px 0',
            }}
          >
            Training Overview
          </h1>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <StatCard
              label="Avg Weekly Miles"
              value={stats?.avgWeeklyMiles ?? 0}
              unit="mi"
            />
            <StatCard
              label="Longest Run"
              value={stats?.longestRun ?? 0}
              unit="mi"
            />
            <StatCard
              label="Consistency"
              value={`${stats?.consistency ?? 0}%`}
            />
            <StatCard
              label="Total Runs"
              value={stats?.totalRuns ?? 0}
            />
          </div>
        </div>

        {/* Pace by Distance */}
        {stats?.paceByDistance && (
          <div
            style={{
              backgroundColor: '#1a1a2e',
              border: '1px solid #2a2a4a',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
            }}
          >
            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
              Estimated Race Paces
            </h2>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {Object.entries(stats.paceByDistance).map(([distance, pace]) => (
                <div key={distance} style={{ minWidth: '100px' }}>
                  <div style={{ color: '#6a6a80', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    {distance}
                  </div>
                  <div style={{ color: pace ? 'white' : '#3a3a50', fontSize: '20px', fontWeight: '600' }}>
                    {pace ? `${pace}` : '—'}
                  </div>
                  {pace && <div style={{ color: '#6a6a80', fontSize: '11px' }}>min/km</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Runs */}
        {stats?.recentRuns && stats.recentRuns.length > 0 && (
          <div
            style={{
              backgroundColor: '#1a1a2e',
              border: '1px solid #2a2a4a',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
            }}
          >
            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
              Recent Runs
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Name', 'Distance', 'Date', 'Pace'].map((header) => (
                      <th
                        key={header}
                        style={{
                          color: '#6a6a80',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderBottom: '1px solid #2a2a4a',
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentRuns.map((run, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          padding: '12px',
                          color: 'white',
                          fontSize: '14px',
                          borderBottom: '1px solid #1e1e35',
                        }}
                      >
                        {run.name}
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          color: '#d0d0e0',
                          fontSize: '14px',
                          borderBottom: '1px solid #1e1e35',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {run.distance} mi
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          color: '#a0a0b0',
                          fontSize: '14px',
                          borderBottom: '1px solid #1e1e35',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {run.date}
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          color: '#FC4C02',
                          fontSize: '14px',
                          fontWeight: '600',
                          borderBottom: '1px solid #1e1e35',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {run.pace} /km
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Race Form */}
        <RaceForm onSubmit={handleCoachSubmit} loading={coachLoading} />

        {/* Coach Error */}
        {coachError && (
          <div
            style={{
              backgroundColor: 'rgba(255, 80, 80, 0.1)',
              border: '1px solid rgba(255, 80, 80, 0.3)',
              borderRadius: '8px',
              padding: '12px 20px',
              marginTop: '16px',
              color: '#ff8080',
            }}
          >
            {coachError}
          </div>
        )}

        {/* Coach Response */}
        <CoachResponse content={coachContent} loading={coachLoading} />
      </main>
    </div>
  );
}
