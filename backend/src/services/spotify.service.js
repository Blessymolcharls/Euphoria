import fetch from 'isomorphic-unfetch';

const EMBED_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
};

/**
 * Extract playlist ID from a Spotify URL.
 */
export const extractPlaylistId = (url) => {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  if (!match) throw new Error('Invalid Spotify playlist URL');
  return match[1];
};

/**
 * Get an anonymous Spotify access token by loading the embed page.
 * Spotify embeds a live Bearer token in the __NEXT_DATA__ script tag.
 */
const getSpotifyEmbedToken = async (playlistId) => {
  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
  const res = await fetch(embedUrl, { headers: EMBED_HEADERS });
  const html = await res.text();

  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
  if (!match) throw new Error('Could not find Spotify embed data');

  const data = JSON.parse(match[1]);
  const stateStr = JSON.stringify(data.props?.pageProps?.state || {});
  const tokenMatch = stateStr.match(/"accessToken"\s*:\s*"([^"]+)"/);
  if (!tokenMatch) throw new Error('Could not find access token in embed page');

  return tokenMatch[1];
};

/**
 * Fetch ALL tracks from a Spotify playlist using the embed token + official API pagination.
 * NO API keys required — uses the anonymous token from Spotify's web embed.
 */
export const fetchSpotifyPlaylist = async (playlistId) => {
  const token = await getSpotifyEmbedToken(playlistId);

  const apiHeaders = {
    Authorization: `Bearer ${token}`,
    'User-Agent': EMBED_HEADERS['User-Agent'],
    Accept: 'application/json',
  };

  // Fetch playlist metadata
  const metaRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?fields=name,description,owner,images,tracks.total`, {
    headers: apiHeaders,
  });
  const meta = await metaRes.json();
  if (meta.error) throw new Error(`Spotify API error: ${meta.error.message}`);

  // Paginate through ALL tracks (100 per page)
  const allTracks = [];
  let offset = 0;
  const total = meta.tracks.total;

  while (offset < total) {
    const tracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=100&fields=items(track(id,name,artists,album,duration_ms))`,
      { headers: apiHeaders }
    );
    const tracksData = await tracksRes.json();
    if (tracksData.error) throw new Error(`Spotify tracks error: ${tracksData.error.message}`);

    for (const item of tracksData.items || []) {
      if (!item?.track?.id) continue; // skip null / local tracks
      allTracks.push({
        spotifyId: item.track.id,
        title: item.track.name,
        artist: item.track.artists.map((a) => a.name).join(', '),
        album: item.track.album?.name || '',
        albumArt: item.track.album?.images?.[0]?.url || '',
        durationMs: item.track.duration_ms,
      });
    }

    offset += 100;
    console.log(`  📦 Spotify: fetched ${Math.min(offset, total)} / ${total} tracks`);
  }

  return {
    spotifyId: playlistId,
    name: meta.name || 'Spotify Playlist',
    description: meta.description || '',
    owner: meta.owner?.display_name || 'Spotify User',
    coverArt: meta.images?.[0]?.url || '',
    totalTracks: allTracks.length,
    tracks: allTracks,
  };
};
