import ConnectButton from '@/components/ConnectButton';

interface PageProps {
  searchParams?: { error?: string };
}

export default function LandingPage({ searchParams }: PageProps) {
  const error = searchParams?.error;

  const errorMessages: Record<string, string> = {
    access_denied: 'You denied access to your Strava account.',
    config_error: 'Server configuration error. Please try again later.',
    auth_failed: 'Authentication failed. Please try again.',
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a35 50%, #0d1a2e 100%)',
      }}
    >
      {/* Decorative background element */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(252,76,2,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '8%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(252,76,2,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '680px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo / Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#FC4C02',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px auto',
            fontSize: '40px',
            boxShadow: '0 8px 32px rgba(252, 76, 2, 0.3)',
          }}
        >
          🏃
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: '800',
            margin: '0 0 16px 0',
            lineHeight: '1.15',
            background: 'linear-gradient(135deg, #ffffff 0%, #d0d0e0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Strava Running Coach
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '18px',
            color: '#a0a0b8',
            lineHeight: '1.7',
            margin: '0 0 12px 0',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Connect your Strava account and get personalized AI coaching advice based on your actual training data.
        </p>

        <p
          style={{
            fontSize: '15px',
            color: '#6a6a80',
            margin: '0 0 40px 0',
          }}
        >
          Race prediction • Training analysis • Personalized recommendations
        </p>

        {/* Error message */}
        {error && errorMessages[error] && (
          <div
            style={{
              backgroundColor: 'rgba(255, 80, 80, 0.1)',
              border: '1px solid rgba(255, 80, 80, 0.3)',
              borderRadius: '8px',
              padding: '12px 20px',
              marginBottom: '24px',
              color: '#ff8080',
              fontSize: '14px',
            }}
          >
            {errorMessages[error]}
          </div>
        )}

        {/* Connect Button */}
        <ConnectButton />

        {/* Feature highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            marginTop: '60px',
          }}
        >
          {[
            { icon: '📊', title: 'Deep Analysis', desc: 'Full activity history analyzed' },
            { icon: '🎯', title: 'Race Ready', desc: 'Time predictions & race prep' },
            { icon: '📈', title: 'Smart Training', desc: 'Data-driven recommendations' },
          ].map((feature) => (
            <div
              key={feature.title}
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
                padding: '20px 16px',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{feature.icon}</div>
              <div style={{ color: 'white', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                {feature.title}
              </div>
              <div style={{ color: '#6a6a80', fontSize: '12px' }}>{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          color: '#3a3a50',
          fontSize: '12px',
          textAlign: 'center',
        }}
      >
        Powered by Claude AI & Strava API
      </div>
    </main>
  );
}
