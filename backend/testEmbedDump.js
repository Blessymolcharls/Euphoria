import fetch from 'isomorphic-unfetch';
import fs from 'fs';

const playlistId = '7FOCgikpjJLYPQfmMhY35c';

async function dumpEmbed() {
  const res = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`);
  const html = await res.text();
  fs.writeFileSync('embed_dump.html', html);
  
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
  if (nextDataMatch) {
    const nextData = JSON.parse(nextDataMatch[1]);
    const trackList = nextData?.props?.pageProps?.state?.data?.entity?.trackList || [];
    console.log(`Found ${trackList.length} tracks.`);
    if (trackList.length > 0) {
       console.log('First track entirely:', JSON.stringify(trackList[0], null, 2));
    }
  }
}

dumpEmbed();
