'use client';

export default function ConnectButton() {
  return (
    <a
      href="/api/auth/strava"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#FC4C02',
        color: 'white',
        padding: '14px 28px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '16px',
        transition: 'background-color 0.2s ease',
        boxShadow: '0 4px 12px rgba(252, 76, 2, 0.3)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#e04402';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#FC4C02';
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
      Connect with Strava
    </a>
  );
}
