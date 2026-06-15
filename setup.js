#!/usr/bin/env node
/**
 * One-time setup: opens Strava OAuth in your browser,
 * captures the refresh token, and saves it to .env
 */

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const CLIENT_ID = process.env.STRAVA_CLIENT_ID || '258193';
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || 'c09ab42716aef98353b74a10ae15a748ee6f05e0';
const PORT = 3737;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname !== '/callback') {
    res.end('Waiting for Strava callback...');
    return;
  }

  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    res.end(`<h2>Error: ${error || 'No code received'}</h2>`);
    server.close();
    return;
  }

  try {
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    const data = await tokenRes.json();

    if (!data.refresh_token) {
      res.end(`<pre>Error: ${JSON.stringify(data, null, 2)}</pre>`);
      server.close();
      return;
    }

    // Save to .env
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    // Update or append STRAVA_REFRESH_TOKEN
    if (envContent.includes('STRAVA_REFRESH_TOKEN=')) {
      envContent = envContent.replace(/STRAVA_REFRESH_TOKEN=.*/g, `STRAVA_REFRESH_TOKEN=${data.refresh_token}`);
    } else {
      envContent += `\nSTRAVA_REFRESH_TOKEN=${data.refresh_token}`;
    }
    fs.writeFileSync(envPath, envContent.trim() + '\n');

    res.end(`
      <html><body style="font-family:sans-serif;max-width:500px;margin:60px auto;text-align:center">
        <h1 style="color:#FC4C02">✓ Connected!</h1>
        <p>Welcome, <strong>${data.athlete?.firstname} ${data.athlete?.lastname}</strong></p>
        <p>Your Strava refresh token has been saved to <code>.env</code></p>
        <p>You can close this window. Claude Desktop is ready to use!</p>
      </body></html>
    `);

    console.log('\n✓ Strava connected successfully!');
    console.log(`  Athlete: ${data.athlete?.firstname} ${data.athlete?.lastname}`);
    console.log('  Refresh token saved to .env\n');
    console.log('You can now restart Claude Desktop and start chatting!\n');

    server.close();
  } catch (err) {
    res.end(`<pre>Error: ${err.message}</pre>`);
    server.close();
  }
});

server.listen(PORT, () => {
  const authUrl =
    `https://www.strava.com/oauth/authorize` +
    `?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=activity:read_all,read`;

  console.log('Opening Strava login in your browser...');
  console.log('If it does not open automatically, visit:\n');
  console.log(authUrl + '\n');

  // Open browser cross-platform
  const cmd = process.platform === 'win32' ? `start "${authUrl}"` :
               process.platform === 'darwin' ? `open "${authUrl}"` :
               `xdg-open "${authUrl}"`;
  exec(cmd);
});
