import fetch from 'isomorphic-unfetch';

const playlistId = '7FOCgikpjJLYPQfmMhY35c';

async function debugEmbed() {
  const res = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  const html = await res.text();
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
  if (!nextDataMatch) return console.log('no match');
  
  const nextData = JSON.parse(nextDataMatch[1]);
  const t = nextData?.props?.pageProps?.state?.data?.entity?.trackList?.[0];
  
  console.log('First track object keys:');
  console.log(Object.keys(t));
  console.log('imageUrl:', t.imageUrl);
  console.log('coverArt:', JSON.stringify(t.coverArt));
  console.log('album:', JSON.stringify(t.album));
}

debugEmbed();
