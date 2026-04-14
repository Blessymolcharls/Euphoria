import fetch from 'isomorphic-unfetch';
import 'dotenv/config';

async function testTracksApi() {
  const authString = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const authRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const { access_token } = await authRes.json();
  console.log('Got DB token:', access_token.substring(0, 20) + '...');

  const playlistId = '7FOCgikpjJLYPQfmMhY35c';
  const trackRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=100&limit=1`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  
  const trackData = await trackRes.json();
  if (trackData.error) {
     console.log('Error:', trackData.error);
  } else {
     console.log('Got paginated track:', trackData.items?.[0]?.track?.name);
  }
}

testTracksApi();
