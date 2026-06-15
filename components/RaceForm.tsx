'use client';

interface RaceFormProps {
  onSubmit: (raceDistance: string, raceDate: string) => void;
  loading: boolean;
}

export default function RaceForm({ onSubmit, loading }: RaceFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const raceDistance = formData.get('raceDistance') as string;
    const raceDate = formData.get('raceDate') as string;

    if (raceDistance && raceDate) {
      onSubmit(raceDistance, raceDate);
    }
  };

  // Get today's date as min date and format for input
  const today = new Date().toISOString().split('T')[0];

  return (
    <div
      style={{
        backgroundColor: '#1a1a2e',
        border: '1px solid #2a2a4a',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '32px',
      }}
    >
      <h2
        style={{
          color: '#FC4C02',
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '20px',
          margin: '0 0 20px 0',
        }}
      >
        Get AI Coaching Advice
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label
              htmlFor="raceDistance"
              style={{
                display: 'block',
                color: '#a0a0b0',
                fontSize: '14px',
                marginBottom: '6px',
                fontWeight: '500',
              }}
            >
              Goal Race Distance
            </label>
            <select
              id="raceDistance"
              name="raceDistance"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#0d0d1a',
                border: '1px solid #3a3a5a',
                borderRadius: '6px',
                color: 'white',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              <option value="">Select distance...</option>
              <option value="5K">5K</option>
              <option value="10K">10K</option>
              <option value="Half Marathon">Half Marathon</option>
              <option value="Marathon">Marathon</option>
            </select>
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <label
              htmlFor="raceDate"
              style={{
                display: 'block',
                color: '#a0a0b0',
                fontSize: '14px',
                marginBottom: '6px',
                fontWeight: '500',
              }}
            >
              Race Date
            </label>
            <input
              type="date"
              id="raceDate"
              name="raceDate"
              min={today}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#0d0d1a',
                border: '1px solid #3a3a5a',
                borderRadius: '6px',
                color: 'white',
                fontSize: '15px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? '#555' : '#FC4C02',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            alignSelf: 'flex-start',
          }}
        >
          {loading ? 'Analyzing...' : 'Get Coaching Advice'}
        </button>
      </form>
    </div>
  );
}
