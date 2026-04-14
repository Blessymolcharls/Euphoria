import fetch from 'isomorphic-unfetch';
import 'dotenv/config';

async function testTracksApi() {
  // 1. Get Client Credentials token
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
  console.log('Got Client Credentials DB token.');

  // 2. Fetch track info for Eminem - Rap God
  const trackIds = '6or1bKJiZ06IlK0vFvY75k';
  const trackRes = await fetch(`https://api.spotify.com/v1/tracks?ids=${trackIds}`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  
  const trackData = await trackRes.json();
  if (trackData.error) {
     console.log('Error:', trackData.error.message);
  } else {
     console.log('Track image URL:', trackData.tracks[0]?.album?.images?.[0]?.url);
  }
}

testTracksApi();
