import fetch from 'isomorphic-unfetch';

async function test() {
  const res = await fetch('https://open.spotify.com/playlist/6TVBfAyDMbEWG88uR7h6QA', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' }
  });
  const text = await res.text();
  const tokenMatch = text.match(/"accessToken"\s*:\s*"([^"]+)"/);
  console.log('Token:', tokenMatch ? tokenMatch[1].substring(0,20) : 'none');
  if (tokenMatch) {
    const tracksRes = await fetch('https://api.spotify.com/v1/playlists/6TVBfAyDMbEWG88uR7h6QA/tracks?offset=100&limit=100', {
      headers: { Authorization: 'Bearer ' + tokenMatch[1] }
    });
    console.log('Offset 100 status:', tracksRes.status);
    const body = await tracksRes.json();
    console.log('Items:', body.items ? body.items.length : body.error);
  }
}
test();
