import fetch from 'isomorphic-unfetch';
import fs from 'fs';

const EMBED_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const playlistId = '7FOCgikpjJLYPQfmMhY35c';

async function testFetchAllFromAPI() {
  console.log('1. Grabbing embed token...');
  const res = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, { headers: EMBED_HEADERS });
  const html = await res.text();
  const token = html.match(/"accessToken":"([^"]{50,})"/)[1];
  
  const apiHeaders = { Authorization: `Bearer ${token}` };
  
  await sleep(1500); // initial small delay
  
  let total = 200; // rough guess
  let offset = 0;
  let allTracks = [];
  
  while (offset < total) {
     console.log(`Fetching offset ${offset}...`);
     const tracksRes = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=100&fields=total,items(track(id,name,artists,album,duration_ms))`,
        { headers: apiHeaders }
     );
     
     if (tracksRes.status === 429) {
        const retryAfter = parseInt(tracksRes.headers.get('retry-after') || '5', 10) * 1000;
        console.log(`  🔁 Rate limited. Retrying after ${retryAfter/1000} seconds...`);
        await sleep(retryAfter + 1000);
        continue;
     }
     
     if (tracksRes.ok) {
         const data = await tracksRes.json();
         total = data.total; // set exact total
         for (const item of data.items || []) {
             allTracks.push(item.track?.name);
         }
         console.log(`  ✅ Added ${data.items.length} tracks. Total so far: ${allTracks.length}/${total}`);
         offset += 100;
     } else {
         console.log(`  ❌ Error ${tracksRes.status}:`, await tracksRes.text());
         break;
     }
  }
}

testFetchAllFromAPI();
