# Strava Running Coach

AI-powered running coach that analyzes your Strava data and provides personalized training advice.

## Setup

1. Clone the repo
2. Copy `.env.local.example` to `.env.local` and fill in values
3. Run `npm install`
4. Run `npm run dev`

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `STRAVA_CLIENT_ID`
   - `STRAVA_CLIENT_SECRET`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
4. Deploy

## Strava App Setup

1. Go to https://www.strava.com/settings/api
2. Create an app with callback domain matching your deployment URL
3. Copy Client ID and Client Secret to .env.local
