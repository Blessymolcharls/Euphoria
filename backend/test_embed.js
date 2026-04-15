import fetch from 'isomorphic-unfetch';

<<<<<<< HEAD
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
=======
(async () => {
  const PROXIES = [
    '',
    'https://api.allorigins.win/raw?url='
  ];
  const playlistId = '6TVBfAyDMbEWG88uR7h6QA';
  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
  
  for (const proxy of PROXIES) {
    try {
      const url = proxy ? proxy + encodeURIComponent(embedUrl) : embedUrl;
      console.log('Fetching:', url);
      const res = await fetch(url);
      const html = await res.text();
      const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
      
      if(match) {
        const data = JSON.parse(match[1]);
        const stateStr = JSON.stringify(data.props?.pageProps?.state || {});
        
        // Let's find tracks array
        const state = data.props?.pageProps?.state || {};
        const tracks = state.data?.entity?.trackList;
        
        console.log('Tracks found:', tracks ? tracks.length : stateStr.length + ' bytes of state');
        
        if (tracks && tracks.length > 0) {
            console.log('Sample track 0 title:', tracks[0]?.title);
            console.log('Sample track 0 uri:', tracks[0]?.uri);
            break;
        }
      }
    } catch(e) {
      console.error(e.message);
    }
  }
})();
>>>>>>> 310c620 (feat: rotating proxy + embed HTML scraper fallback to bypass IP ban)
