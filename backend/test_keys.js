import fetch from 'isomorphic-unfetch';
import * as dotenv from 'dotenv';
dotenv.config();

(async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  let res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  let data = await res.json();
  const token = data.access_token;

  const playlistId = '6TVBfAyDMbEWG88uR7h6QA';
  res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?fields=name,description,owner,images,tracks.total`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  data = await res.json();
  console.log('Raw Response:', JSON.stringify(data, null, 2));
})();
