import fetch from 'isomorphic-unfetch';

const playlistId = '7FOCgikpjJLYPQfmMhY35c';

async function testTracksWithEmbed() {
  const embedRes = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const html = await embedRes.text();
  const token = html.match(/"accessToken":"([^"]{50,})"/)[1];
  
  await new Promise(r => setTimeout(r, 2000));
  
  const trackIds = '6or1bKJiZ06IlK0vFvY75k'; // Rap God
  const trackRes = await fetch(`https://api.spotify.com/v1/tracks?ids=${trackIds}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log('Status via Embed token:', trackRes.status);
  const trackData = await trackRes.json();
  if (trackData.error) {
     console.log('Error:', trackData.error.message);
  } else {
     console.log('Track image URL:', trackData.tracks[0]?.album?.images?.[0]?.url);
  }
}

testTracksWithEmbed();
