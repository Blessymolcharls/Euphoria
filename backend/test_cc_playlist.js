import fetch from 'isomorphic-unfetch';
import 'dotenv/config';

async function testCC() {
  const authString = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const authRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${authString}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });
  const { access_token } = await authRes.json();
  const playlistId = '6TVBfAyDMbEWG88uR7h6QA'; // huge playlist
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=100&limit=100`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const data = await res.json();
  console.log('Status:', res.status, 'Items:', data.items?.length, 'Error:', data.error);
}
testCC();
