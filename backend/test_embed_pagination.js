import fetch from 'isomorphic-unfetch';

const EMBED_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

const getEmbedData = async (playlistId) => {
  const res = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, { headers: EMBED_HEADERS });
  const html = await res.text();
  const tokenMatch = html.match(/"accessToken"\s*:\s*"([^"]{50,})"/);
  const token = tokenMatch ? tokenMatch[1] : null;

  let initialTracks = [];
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
  if (nextDataMatch) {
    const nextData = JSON.parse(nextDataMatch[1]);
    const entity = nextData?.props?.pageProps?.state?.data?.entity;
    if (entity) {
      initialTracks = (entity.trackList || []).map((t) => ({ spotifyId: t.uid || t.id }));
    }
  }
  return { token, initialTracks };
};

const testPagination = async () => {
    const playlistId = '6TVBfAyDMbEWG88uR7h6QA';
    
    // 1. Get embed token
    const { token, initialTracks } = await getEmbedData(playlistId);
    console.log("Embed token:", token.substring(0,20) + "...");
    console.log("Embed initial tracks:", initialTracks.length);
    
    // 2. Try fetching offset=100
    const tracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=100&limit=100&fields=total,items(track(id,name,artists,album,duration_ms))`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    );
    console.log("Tracks status:", tracksRes.status);
    if (!tracksRes.ok) {
        console.log("Tracks error:", await tracksRes.text());
    } else {
        const body = await tracksRes.json();
        console.log("Tracks fetched at offset 100:", body.items?.length, "Total reported:", body.total);
    }
};

testPagination();
