import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Strava Running Coach',
  description: 'AI-powered running coach that analyzes your Strava data and provides personalized training advice.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
          backgroundColor: '#0d0d1a',
          color: 'white',
          minHeight: '100vh',
        }}
      >
        {children}
      </body>
    </html>
  );
}
