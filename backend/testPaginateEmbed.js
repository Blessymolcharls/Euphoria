import fetch from 'isomorphic-unfetch';

const playlistId = '7FOCgikpjJLYPQfmMhY35c';

async function testPaginateWithEmbedToken() {
  console.log('1. Getting token from embed player...');
  const embedRes = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const html = await embedRes.text();
  const tokenMatch = html.match(/"accessToken":"([^"]{50,})"/);
  
  if (!tokenMatch) {
    console.log('Token not found in embed'); return;
  }
  const token = tokenMatch[1];
  console.log('Token grabbed:', token.substring(0, 30) + '...');

  console.log('\n2. Sleeping 2 seconds to avoid rate limits...');
  await new Promise(r => setTimeout(r, 2000));

  console.log('\n3. Fetching page 2 (offset 100)...');
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
  
  const apiRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=100&limit=100`, { headers });
  console.log('Status:', apiRes.status);
  
  if (apiRes.status === 200) {
      const data = await apiRes.json();
      console.log(`Success! Got ${data.items.length} tracks. Total is ${data.total}`);
  } else {
      console.log('Error:', await apiRes.text());
  }
}

testPaginateWithEmbedToken();
