import fetch from 'isomorphic-unfetch';

const playlistId = '7FOCgikpjJLYPQfmMhY35c';

const embedRes = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  }
});
const html = await embedRes.text();

// Look for token in HTML directly (regex in raw HTML)
const tokenPatterns = [
  /"accessToken":"([^"]{50,})"/,
  /accessToken%22%3A%22([^%"]{50,})/,
  /"access_token":"([^"]{50,})"/,
  /Bearer ([A-Za-z0-9_.-]{50,})/,
];

for (const pattern of tokenPatterns) {
  const m = html.match(pattern);
  if (m) {
    console.log('Found token with pattern:', pattern.toString().slice(0, 40));
    console.log('Token (40 chars):', m[1].slice(0, 40));
    
    // Test the token against pages 2+
    const apiRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=100&limit=100`, {
      headers: { Authorization: `Bearer ${m[1]}` }
    });
    const d = await apiRes.json();
    console.log('API test status:', apiRes.status, '| tracks page 2:', d.items?.length ?? d.error?.message);
    break;
  }
}

const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
const nextData = JSON.parse(nextDataMatch[1]);

// Print track shape
const t = nextData?.props?.pageProps?.state?.data?.entity?.trackList?.[0];
console.log('\nFirst track:', JSON.stringify(t));
