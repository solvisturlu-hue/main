require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, REDIRECT_URI, PORT = 3000 } = process.env;

app.get('/', (req, res) => {
  const authUrl =
    `https://www.strava.com/oauth/authorize` +
    `?client_id=${STRAVA_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=read,activity:read_all`;

  res.send(`
    <html><body style="font-family:sans-serif;max-width:600px;margin:60px auto;text-align:center">
      <h1>Strava Connect</h1>
      <a href="${authUrl}" style="background:#fc4c02;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-size:16px">
        Connect with Strava
      </a>
    </body></html>
  `);
});

app.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.send(`<p>Authorization denied or failed: ${error || 'no code'}</p>`);
  }

  try {
    const tokenRes = await axios.post('https://www.strava.com/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });

    const { access_token, athlete } = tokenRes.data;

    // Fetch recent activities
    const activitiesRes = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${access_token}` },
      params: { per_page: 10 },
    });

    const activities = activitiesRes.data;

    const rows = activities.map(a => `
      <tr>
        <td>${a.name}</td>
        <td>${a.type}</td>
        <td>${(a.distance / 1000).toFixed(2)} km</td>
        <td>${Math.round(a.moving_time / 60)} min</td>
        <td>${new Date(a.start_date_local).toLocaleDateString()}</td>
      </tr>`).join('');

    res.send(`
      <html><body style="font-family:sans-serif;max-width:800px;margin:40px auto">
        <h1>Welcome, ${athlete.firstname} ${athlete.lastname}!</h1>
        <img src="${athlete.profile}" width="80" style="border-radius:50%">
        <p>${athlete.city}, ${athlete.country}</p>
        <h2>Recent Activities</h2>
        <table border="1" cellpadding="8" cellspacing="0" width="100%">
          <thead><tr><th>Name</th><th>Type</th><th>Distance</th><th>Duration</th><th>Date</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5">No activities found</td></tr>'}</tbody>
        </table>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send(`<pre>Error: ${err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message}</pre>`);
  }
});

app.listen(PORT, () => {
  console.log(`Open http://localhost:${PORT} in your browser`);
});
