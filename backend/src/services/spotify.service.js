import fetch from 'isomorphic-unfetch';
import { fetchPlaylistViaEmbed } from './spotifyEmbed.service.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extract playlist ID from a Spotify URL.
 */
export const extractPlaylistId = (url) => {
  // Handle spotify:playlist:ID URI format
  const uriMatch = url.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];

  // Handle https://open.spotify.com/playlist/ID?si=... and similar
  const urlMatch = url.match(/playlist\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];

  throw new Error('Invalid Spotify playlist URL. Please paste a link like: https://open.spotify.com/playlist/...');
};

/**
 * Get Spotify access token using Client Credentials Flow (no user login needed).
 */
<<<<<<< HEAD
const getSpotifyAuthToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify Client Credentials in .env');
  }
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to get Spotify access token');
  return data.access_token;
};

/**
 * Get playlist track count with a lightweight metadata request.
 * Returns null when Spotify blocks client-credentials access for this playlist.
 */
export const fetchSpotifyPlaylistTrackCount = async (playlistId) => {
  const token = await getSpotifyAuthToken();
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}?fields=tracks.total`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
  );
  const data = await res.json();

  if (data.error) {
    if (data.error.status === 403) return null;
    if (data.error.status === 404) {
      throw new Error('Playlist not found. Check the URL and make sure it is correct.');
    }
    throw new Error(`Spotify API error: ${data.error.message}`);
  }

  return data?.tracks?.total ?? 0;
};

/**
 * Fetch ALL tracks from a Spotify playlist.
 * Works for any PUBLIC playlist without requiring user login.
 */
export const fetchSpotifyPlaylist = async (playlistId) => {
  const token = await getSpotifyAuthToken();
  const apiHeaders = { Authorization: `Bearer ${token}`, Accept: 'application/json' };

  // Fetch playlist metadata (name, cover, owner etc.)
  const metaRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: apiHeaders,
  });
  const meta = await metaRes.json();
  if (meta.error) {
    if (meta.error.status === 404) {
      throw new Error('Playlist not found. Check the URL and make sure it is correct.');
    }
    if (meta.error.status === 403) {
      // Client Credentials blocked — silently fall back to embed scraper
      console.log('  ⚠ Client Credentials 403 on metadata — falling back to embed scraper...');
      return fetchPlaylistViaEmbedWrapped(playlistId);
    }
    throw new Error(`Spotify API error: ${meta.error.message}`);
=======
export const getSpotifyEmbedToken = async (playlistId) => {
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
 * Includes a throttle delay to prevent Rate Limiting (429) on large playlists.
 */
export const fetchSpotifyPlaylist = async (playlistId) => {
  console.log('  🔍 Spotify: Extracting anonymous token from embed...');
  const token = await getSpotifyEmbedToken(playlistId);

  const apiHeaders = {
    Authorization: `Bearer ${token}`,
    'User-Agent': EMBED_HEADERS['User-Agent'],
    Accept: 'application/json',
  };

  // Fetch playlist metadata with retry logic for 429
  console.log(`  🎵 Spotify: Fetching metadata for ${playlistId}`);
  let metaRes, meta;
  while (true) {
    metaRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?fields=name,description,owner,images,tracks.total`, {
      headers: apiHeaders,
    });
    
    if (metaRes.status === 429) {
      const waitSeconds = metaRes.headers.get('Retry-After') || 5;
      console.warn(`  ⚠️ Spotify Rate Limit Hit on Metadata! Retrying in ${waitSeconds} seconds...`);
      await delay(waitSeconds * 1000);
      continue;
    }
    
    meta = await metaRes.json();
    if (meta.error) {
      throw new Error(`Spotify API error: ${meta.error.message}`);
    }
    break;
>>>>>>> cc2837f (feat: revert to keyless scanner and add throttle for 675 tracks)
  }

  // Paginate through ALL tracks
  const allTracks = [];
  let offset = 0;
  let total = null;

<<<<<<< HEAD
  do {
=======
  console.log(`  📦 Spotify: Playlist has ${total} tracks. Starting paginated extraction...`);

  while (offset < total) {
    // THROTTLE: Wait 1.5 seconds between requests to bypass rate limiting on huge playlists
    if (offset > 0) {
      await delay(1500); 
    }

>>>>>>> cc2837f (feat: revert to keyless scanner and add throttle for 675 tracks)
    const tracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=100&fields=total,items(track(id,name,artists,album,duration_ms))`,
      { headers: apiHeaders }
    );
    
    if (tracksRes.status === 429) {
      const waitSeconds = tracksRes.headers.get('Retry-After') || 5;
      console.warn(`  ⚠️ Spotify Rate Limit Hit on Tracks! Applying emergency ${waitSeconds}-second backoff...`);
      await delay(waitSeconds * 1000);
      continue; // retry the same offset
    }

    const tracksData = await tracksRes.json();

<<<<<<< HEAD
    if (tracksData.error) {
      if (tracksData.error.status === 403) {
        // Tracks endpoint blocked — fall back to embed scraper
        console.log('  ⚠ Client Credentials 403 on tracks — falling back to embed scraper...');
        return fetchPlaylistViaEmbedWrapped(playlistId);
      }
      throw new Error(`Spotify tracks error: ${tracksData.error.message}`);
    }

    if (total === null) total = tracksData.total ?? 0;
=======
    if (tracksData.error) throw new Error(`Spotify tracks error: ${tracksData.error.message}`);
>>>>>>> cc2837f (feat: revert to keyless scanner and add throttle for 675 tracks)

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
  } while (offset < total);

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

/**
 * Wrap the embed service result into the same shape as fetchSpotifyPlaylist.
 */
const fetchPlaylistViaEmbedWrapped = async (playlistId) => {
  const result = await fetchPlaylistViaEmbed(playlistId);
  return {
    spotifyId: playlistId,
    name: result.playlistName,
    description: '',
    owner: result.owner,
    coverArt: result.coverArt,
    totalTracks: result.tracks.length,
    tracks: result.tracks,
  };
};
