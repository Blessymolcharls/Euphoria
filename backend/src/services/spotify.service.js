import fetch from 'isomorphic-unfetch';
import { fetchPlaylistViaEmbed } from './spotifyEmbed.service.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const EMBED_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Cache-Control': 'max-age=0'
};

const PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  '' // direct fallback
];

/**
 * Extract playlist ID from a Spotify URL.
 */
export const extractPlaylistId = (url) => {
  const uriMatch = url.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];
  const urlMatch = url.match(/playlist\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];
  throw new Error('Invalid Spotify playlist URL. Please paste a link like: https://open.spotify.com/playlist/...');
};

const scrapeEmbedPlaylist = async (playlistId) => {
  try {
    const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
    const res = await fetch(embedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error('Embed fetch failed');
    
    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (!match) throw new Error('No NEXT_DATA found');
    
    const data = JSON.parse(match[1]);
    const entity = data.props?.pageProps?.state?.data?.entity || {};
    const trackList = entity.trackList || [];
    
    console.log(`  🛟 HTML Embed Bypass: Successfully scraped ${trackList.length} tracks!`);
    
    return {
      spotifyId: playlistId,
      name: (entity.title || entity.name || 'Spotify Playlist') + ' [HTML Bypassed]',
      description: 'Extracted via HTML Scraper',
      owner: 'Spotify User',
      coverArt: entity.coverArt?.sources?.[0]?.url || 'https://placehold.co/400',
      totalTracks: trackList.length,
      tracks: trackList.map((t, idx) => ({
        spotifyId: t.id || `scraped-${idx}`,
        title: t.title,
        artist: t.subtitle || 'Unknown Artist',
        album: 'Unknown Album',
        albumArt: entity.coverArt?.sources?.[0]?.url || 'https://placehold.co/400',
        durationMs: t.duration || 180000
      }))
    };
  } catch (err) {
    console.warn(`  ⚠️ HTML Scrape Fallback failed: ${err.message}`);
    throw err;
  }
};

export const getSpotifyEmbedToken = async (playlistId) => {
  const embedUrl = encodeURIComponent(`https://open.spotify.com/embed/playlist/${playlistId}`);
  let lastError;

  for (const proxy of PROXIES) {
    try {
      const url = proxy ? `${proxy}${embedUrl}` : `https://open.spotify.com/embed/playlist/${playlistId}`;
      console.log(`  🔌 Trying to fetch token via: ${proxy ? proxy : 'Direct Access'}`);
      
      const res = await fetch(url, { headers: EMBED_HEADERS, timeout: 5000 });
      if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
      
      const html = await res.text();
      const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
      if (!match) throw new Error('Could not find Spotify embed data');

      const data = JSON.parse(match[1]);
      const stateStr = JSON.stringify(data.props?.pageProps?.state || {});
      const tokenMatch = stateStr.match(/"accessToken"\s*:\s*"([^"]+)"/);
      if (!tokenMatch) throw new Error('Could not find access token in embed page');

      console.log('  ✅ Successfully extracted anonymous token!');
      return tokenMatch[1];
    } catch (err) {
      console.warn(`  ⚠️ Proxy failed: ${err.message}`);
      lastError = err;
    }
  }
  throw new Error(`All token extraction methods failed: ${lastError.message}`);
};

/**
 * Get playlist track count.
 */
export const fetchSpotifyPlaylistTrackCount = async (playlistId) => {
  try {
    const token = await getSpotifyEmbedToken(playlistId);
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?fields=tracks.total`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
    const data = await res.json();
    return data?.tracks?.total ?? 0;
  } catch (e) {
    return 0;
  }
};

/**
 * Fetch ALL tracks from a Spotify playlist. 
 * Falls back to HTML scrape if API gets banned/throttled.
 */
export const fetchSpotifyPlaylist = async (playlistId) => {
  console.log('  🎵 Spotify: Attempting HTML Embed scrape (ban-proof fallback)...');
  let embedResult;
  try {
    embedResult = await scrapeEmbedPlaylist(playlistId);
  } catch (err) {
    console.warn('  ⚠️ Embed scrape failed:', err.message);
  }

  console.log('  🔍 Spotify: Extracting anonymous token to check API access...');
  let token;
  try {
    token = await getSpotifyEmbedToken(playlistId);
  } catch (err) {
    if (embedResult) return embedResult;
    throw new Error('Both strategies failed');
  }

  const apiHeaders = {
    Authorization: `Bearer ${token}`,
    'User-Agent': EMBED_HEADERS['User-Agent'],
    Accept: 'application/json',
  };

  console.log(`  🎵 Spotify: Fetching metadata for ${playlistId}`);
  let metaRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?fields=name,description,owner,images,tracks.total`, {
    headers: apiHeaders,
  });

  if (metaRes.status === 429 || metaRes.status === 403) {
    console.warn(`  ⚠️ API Rate Limited or Banned. Using embed scrape result.`);
    if (embedResult) return embedResult;
    throw new Error('Rate limited and embed scrape failed');
  }

  const meta = await metaRes.json();
  if (meta.error) {
    if (embedResult) return embedResult;
    throw new Error(`Spotify API error: ${meta.error.message}`);
  }

  const allTracks = [];
  let offset = 0;
  let total = meta.tracks?.total ?? 0;

  console.log(`  📦 Spotify: Playlist has ${total} tracks. Starting paginated extraction...`);

  while (offset < total) {
    if (offset > 0) await delay(1500); 

    const tracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=100&fields=total,items(track(id,name,artists,album,duration_ms))`,
      { headers: apiHeaders }
    );
    
    if (tracksRes.status === 429 || tracksRes.status === 403) {
      console.warn(`  ⚠️ API Rate Limit Hit during tracks! Breaking loop early.`);
      break; 
    }

    const tracksData = await tracksRes.json();
    if (tracksData.error) {
      console.warn(`  ⚠️ Error on tracks chunk: ${tracksData.error.message}`);
      break;
    }

    for (const item of tracksData.items || []) {
      if (!item?.track?.id) continue;
      allTracks.push({
        spotifyId: item.track.id,
        title: item.track.name || 'Unknown Title',
        artist: item.track.artists?.map((a) => a.name).join(', ') || 'Unknown Artist',
        album: item.track.album?.name || '',
        albumArt: item.track.album?.images?.[0]?.url || '',
        durationMs: item.track.duration_ms || 0,
      });
    }

    offset += 100;
    console.log(`  📦 Spotify: fetched ${Math.min(offset, total)} / ${total} tracks`);
  }

  // If we got cut short but standard scraping got everything, return the full standard scrape
  if (allTracks.length < total && embedResult && embedResult.tracks.length > allTracks.length) {
    return embedResult;
  }

  return {
    spotifyId: playlistId,
    name: meta.name || 'Spotify Playlist',
    description: meta.description || '',
    owner: meta.owner?.display_name || 'Spotify User',
    coverArt: meta.images?.[0]?.url || '',
    totalTracks: allTracks.length,
    tracks: allTracks.length > 0 ? allTracks : (embedResult ? embedResult.tracks : []),
  };
};
