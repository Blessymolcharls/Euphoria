import dotenv from 'dotenv';
dotenv.config();

import fetch from 'isomorphic-unfetch';

const getSpotifyAuthToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
};

const run = async () => {
    const token = await getSpotifyAuthToken();
    const playlistId = '6TVBfAyDMbEWG88uR7h6QA';
    console.log("Token:", token.substring(0, 10) + '...');
    
    // First, let's see if /playlists works
    const metaRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const meta = await metaRes.json();
    console.log("Meta request ok?", metaRes.ok);
    console.log("Meta tracks count:", meta.tracks?.items?.length);
    console.log("Meta tracks total count string:", meta.tracks?.total);
    
    // Let's see if /playlists/{id}/tracks works with offset=100
    const tracksRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=100&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Tracks request offset=100 ok?", tracksRes.ok);
    if (!tracksRes.ok) {
        console.log("Tracks error:", await tracksRes.text());
    }
}
run();
