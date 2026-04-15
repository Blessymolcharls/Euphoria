import fetch from 'isomorphic-unfetch';
import dotenv from 'dotenv';
dotenv.config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
console.log('Using Client ID:', clientId);
console.log('Using Client Secret:', clientSecret);

async function test() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();
  console.log('Token Type:', data.token_type);
  console.log('Access Token Length:', data.access_token ? data.access_token.length : 0);

  const token = data.access_token;
  
  // Test Playlist
  const pRes = await fetch('https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF?market=US', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Playlist Response Status:', pRes.status);
  console.log('Playlist Response Data:', await pRes.json());
}

test();
