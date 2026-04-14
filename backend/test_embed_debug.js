/**
 * Debug: load embed iframe and extract token from JS chunk
 */
import fetch from 'isomorphic-unfetch';

const EMBED_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

const playlistId = '38BH3tVShlJxZeqAOKHgkT';

async function debug() {
  // Step 1: load the embed page
  const res = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
    headers: EMBED_HEADERS,
  });
  const html = await res.text();
  console.log('Embed page status:', res.status, '| length:', html.length);
  
  // Get all script src URLs
  const scriptSrcs = [...html.matchAll(/src="(https:\/\/embed-cdn\.spotifycdn\.com[^"]+\.js[^"]*)"/g)].map(m => m[1]);
  console.log('\nScript chunks found:', scriptSrcs.length);
  scriptSrcs.forEach(s => console.log(' -', s));

  // Step 2: search each JS chunk for the token pattern  
  const tokenPatterns = [
    /"accessToken"\s*:\s*"([A-Za-z0-9_\-\.]{100,})"/,
    /accessToken['"]\s*:\s*['"]([A-Za-z0-9_\-\.]{100,})['"]/,
    /Bearer ([A-Za-z0-9_\-\.]{100,})/,
    /"token"\s*:\s*"([A-Za-z0-9_\-\.]{100,})"/,
  ];

  for (const src of scriptSrcs.slice(0, 5)) {
    try {
      const chunkRes = await fetch(src, { headers: { 'User-Agent': EMBED_HEADERS['User-Agent'] } });
      const code = await chunkRes.text();
      // Just check first 10000 chars
      const snippet = code.substring(0, 10000);
      for (const pat of tokenPatterns) {
        const m = snippet.match(pat);
        if (m) {
          console.log(`\n✅ Found token in ${src.split('/').pop()}: ${m[1].substring(0, 30)}...`);
        }
      }
    } catch (e) {
      console.log('Failed to fetch', src.split('/').pop(), ':', e.message);
    }
  }

  // Step 3: Try fetching a token via clienttoken API with correct client_id from embed HTML
  const clientIdMatch = html.match(/clientId['"]\s*:\s*['"]([a-f0-9]+)['"]/i) 
                     || html.match(/client_id['"]\s*:\s*['"]([a-f0-9]+)['"]/i)
                     || html.match(/d8a5ed958d274c2e8ee717e6a4b0971d/);  // known embed client ID
  console.log('\nClient ID in HTML:', clientIdMatch ? clientIdMatch[0] : 'not found');
  console.log('\nHTML snippet around scripts:');
  console.log(html.substring(0, 500));
}

debug().catch(console.error);
