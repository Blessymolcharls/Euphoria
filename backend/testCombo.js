import fetch from 'isomorphic-unfetch';

const playlistId = '7FOCgikpjJLYPQfmMhY35c';

async function testFetch() {
  console.log('1. Scrape token...');
  const embedRes = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const html = await embedRes.text();
  const token = html.match(/"accessToken":"([^"]{50,})"/)[1];
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('2. Request metadata WITH first 100 tracks...');
  const apiHeaders = { Authorization: `Bearer ${token}` };
  const metaRes = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}?fields=name,description,owner,images,tracks(total,items(track(id,name,artists,album,duration_ms)))`, 
    { headers: apiHeaders }
  );
  console.log('Status:', metaRes.status);
  
  const data = await metaRes.json();
  if (data.error) {
     console.log('Error:', data.error);
  } else {
     console.log('Tracks gathered in metadata call:', data.tracks?.items?.length);
     console.log('Total tracks in playlist:', data.tracks?.total);
     if (data.tracks?.items?.length > 0) {
       console.log('First track album art:', data.tracks.items[0].track?.album?.images?.[0]?.url);
     }
  }
}

testFetch();
