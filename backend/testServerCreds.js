import fetch from 'isomorphic-unfetch';
import 'dotenv/config';

async function testProperClientCreds() {
  const authRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    }),
  });
  const authData = await authRes.json();
  const token = authData.access_token;
  console.log('Got Server Token');

  // Let's request the FIRST 50 tracks of the exact playlist just to see if it allows tracks if we don't ask for metadata?
  // No, the playlist itself is Forbidden.
  // Let's request the Tracks by IDs natively.
  const trackIds = '6or1bKJiZ06IlK0vFvY75k,7qiZfU4dY1lWllzX7mPBI3'; // Rap God, Shape of You
  const tracksRes = await fetch(`https://api.spotify.com/v1/tracks?ids=${trackIds}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (tracksRes.status === 200) {
      const data = await tracksRes.json();
      console.log('Success!', data.tracks.map(t => t?.album?.images?.[0]?.url));
  } else {
      console.log('Error:', tracksRes.status, await tracksRes.text());
  }
}

testProperClientCreds();
