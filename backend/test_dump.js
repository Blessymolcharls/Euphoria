import fetch from 'isomorphic-unfetch';
import fs from 'fs';

const playlistId = '7FOCgikpjJLYPQfmMhY35c';

async function dump() {
  console.log('Fetching main web player page...');
  const res = await fetch(`https://open.spotify.com/playlist/${playlistId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    }
  });
  
  const text = await res.text();
  fs.writeFileSync('spotify_dump.html', text);
  console.log('Saved to spotify_dump.html');
}

dump();
