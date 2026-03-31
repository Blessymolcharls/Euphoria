import fetch from 'isomorphic-unfetch';

// Try to get Spotify's anonymous web player token with full browser headers
const getAnonToken = async () => {
  const res = await fetch('https://open.spotify.com/get_access_token?reason=transport&productType=web_player', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://open.spotify.com/',
      'Origin': 'https://open.spotify.com',
    }
  });
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return data.accessToken;
  } catch(e) {
    console.log('Token response (not JSON):', text.substring(0, 200));
    return null;
  }
};

const token = await getAnonToken();
if (!token) {
  console.log('Failed to get token');
  process.exit(1);
}
console.log('Got token! Fetching all tracks...');

// Now paginate through all tracks
const playlistId = '6TVBfAyDMbEWG88uR7h6QA';
let offset = 0;
let total = 0;
let allTracks = [];

do {
  const r = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=100`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await r.json();
  if (data.error) { console.error('API error:', data.error); break; }
  total = data.total;
  allTracks.push(...data.items.filter(i => i?.track));
  offset += 100;
  console.log(`Fetched ${allTracks.length} / ${total}`);
} while (offset < total);

console.log('DONE! Total tracks:', allTracks.length);
console.log('First:', allTracks[0]?.track?.name, '-', allTracks[0]?.track?.artists?.[0]?.name);
