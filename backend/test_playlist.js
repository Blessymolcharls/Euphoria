import * as dotenv from 'dotenv';
dotenv.config();
import fetch from 'isomorphic-unfetch';

const playlistId = '7FOCgikpjJLYPQfmMhY35c';

const credentials = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'grant_type=client_credentials'
});
const { access_token } = await tokenRes.json();

// Test with market param
const tests = [
  `/playlists/${playlistId}/tracks?limit=1`,
  `/playlists/${playlistId}/tracks?limit=1&market=IN`,
  `/playlists/${playlistId}/tracks?limit=1&market=US`,
];

for (const path of tests) {
  const r = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const d = await r.json();
  console.log(`${path}\n  status: ${r.status}, error: ${d.error?.message || 'none'}, total: ${d.total ?? 'N/A'}\n`);
}
