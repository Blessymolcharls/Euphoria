import fetch from 'isomorphic-unfetch';
import { fetchPlaylistViaEmbed } from './spotifyEmbed.service.js';

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
  }

  // Paginate through ALL tracks
  const allTracks = [];
  let offset = 0;
  let total = null;

  do {
    const tracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=100&fields=total,items(track(id,name,artists,album,duration_ms))`,
      { headers: apiHeaders }
    );
    const tracksData = await tracksRes.json();

    if (tracksData.error) {
      if (tracksData.error.status === 403) {
        // Tracks endpoint blocked — fall back to embed scraper
        console.log('  ⚠ Client Credentials 403 on tracks — falling back to embed scraper...');
        return fetchPlaylistViaEmbedWrapped(playlistId);
      }
      throw new Error(`Spotify tracks error: ${tracksData.error.message}`);
    }

    if (total === null) total = tracksData.total ?? 0;

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
