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
    
    // Let's see if /playlists/{id}/tracks works with offset=0
    const tracksRes0 = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=0&limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Tracks request offset=0 ok?", tracksRes0.ok);
    if (!tracksRes0.ok) {
        console.log("Tracks error 0:", await tracksRes0.text());
    }

    // Let's see if /playlists/{id}/tracks works with offset=100
    const tracksRes100 = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=100&limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Tracks request offset=100 ok?", tracksRes100.ok);
    if (!tracksRes100.ok) {
        console.log("Tracks error 100:", await tracksRes100.text());
    }
}
run();
