import fetch from 'isomorphic-unfetch';
import fs from 'fs';

async function dumpFullPlaylist() {
  const playlistId = '7FOCgikpjJLYPQfmMhY35c';
  const res = await fetch(`https://open.spotify.com/playlist/${playlistId}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' }
  });
  const html = await res.text();
  
  // They use base64 encoded scripts. 
  const regex = /<script id="initial-state" type="text\/plain">(.+?)<\/script>/s;
  const match = html.match(regex);
  if (match) {
      const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
      const obj = JSON.parse(decoded);
      // Let's count how many tracks are here.
      let trackCount = 0;
      let firstTrack = null;
      // Object keys are spotify URIs
      for (const key of Object.keys(obj)) {
          if (key.includes('spotify:track:')) {
             trackCount++;
             if (!firstTrack) firstTrack = obj[key];
          }
      }
      console.log('Total tracks strictly in HTML:', trackCount);
      process.exit(0);
  } else {
      console.log('No initial-state found.');
  }
}
dumpFullPlaylist();
