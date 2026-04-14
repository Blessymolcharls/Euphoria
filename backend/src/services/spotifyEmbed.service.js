import fetch from 'isomorphic-unfetch';

const EMBED_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Token pool: keeps 2 fresh embed tokens at once ──────────────────────────
// Each embed page fetch gives a brand-new anonymous token.
// We rotate through fresh tokens so we never hit a stale / rate-limited one.
let _tokenCache = null;
let _tokenFetchedAt = 0;
const TOKEN_TTL_MS = 55 * 1000; // Spotify embed tokens last ~60 seconds
const PARTNER_FETCH_PLAYLIST_HASH = '346811f856fb0b7e4f6c59f8ebea78dd081c6e2fb01b77c954b26259d5fc6763';

const getFreshToken = async (playlistId) => {
  const now = Date.now();
  if (_tokenCache && now - _tokenFetchedAt < TOKEN_TTL_MS) {
    return _tokenCache;
  }

  const res = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
    headers: EMBED_HEADERS,
  });
  if (!res.ok) throw new Error(`Embed page returned ${res.status}`);
  const html = await res.text();

  const tokenMatch = html.match(/"accessToken"\s*:\s*"([^"]{50,})"/);
  if (!tokenMatch) throw new Error('Could not extract access token from Spotify embed page');

  _tokenCache = tokenMatch[1];
  _tokenFetchedAt = now;
  return _tokenCache;
};

// ─── Parse first 100 tracks + meta from embed HTML ───────────────────────────
const getEmbedData = async (playlistId) => {
  const res = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
    headers: EMBED_HEADERS,
  });
  if (!res.ok) throw new Error(`Embed page returned ${res.status}`);
  const html = await res.text();

  // Extract access token
  const tokenMatch = html.match(/"accessToken"\s*:\s*"([^"]{50,})"/);
  if (!tokenMatch) throw new Error('Could not extract access token from Spotify embed page');

  // Cache it immediately
  _tokenCache = tokenMatch[1];
  _tokenFetchedAt = Date.now();

  // Extract track list + meta from __NEXT_DATA__
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
  let initialTracks = [];
  let playlistMeta = { name: 'Spotify Playlist', coverArt: '' };

  if (nextDataMatch) {
    try {
      const nextData = JSON.parse(nextDataMatch[1]);
      const entity = nextData?.props?.pageProps?.state?.data?.entity;
      if (entity) {
        playlistMeta = {
          name: entity.name || 'Spotify Playlist',
          coverArt: entity.images?.[0]?.url || entity.coverArt?.sources?.[0]?.url || '',
        };
        initialTracks = (entity.trackList || []).map((t) => ({
          spotifyId: t.uid || t.id || '',
          title: t.title || 'Unknown Title',
          artist: t.subtitle || 'Unknown Artist',
          album: '',
          albumArt: t.coverArt?.sources?.[0]?.url || t.imageUrl || playlistMeta.coverArt,
          durationMs: t.duration || 0,
        }));
      }
    } catch {
      // ignore JSON parse errors
    }
  }

  // Backfill missing album art via iTunes Search API concurrently in batches
  const itunesQueue = initialTracks.filter((t) => t.albumArt === playlistMeta.coverArt && t.title);
  
  for (let i = 0; i < itunesQueue.length; i += 10) {
    const chunk = itunesQueue.slice(i, i + 10);
    await Promise.all(
      chunk.map(async (t) => {
        try {
          const fetchWithTimeout = (url) => Promise.race([
            fetch(url),
            new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3000))
          ]);
          
          let query = encodeURIComponent(`${t.title} ${t.artist}`);
          let itunesRes = await fetchWithTimeout(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
          let data = await itunesRes.json();
          
          if (data.results?.[0]?.artworkUrl100) {
            t.albumArt = data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
          } else {
            query = encodeURIComponent(t.title);
            itunesRes = await fetchWithTimeout(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
            data = await itunesRes.json();
            if (data.results?.[0]?.artworkUrl100) {
              t.albumArt = data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
            }
          }
        } catch {
          // ignore timeouts or parsing issues
        }
      })
    );
    await sleep(200); // slight delay between batches to respect rate limits
  }

  return { token: _tokenCache, initialTracks, playlistMeta };
};

// ─── Fetch ONE page of tracks, refreshing token if rate-limited ───────────────
const fetchTracksPage = async (playlistId, offset, maxRetries = 4) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Always get a potentially-refreshed token (handled by TTL cache)
    const token = await getFreshToken(playlistId);

    const tracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=100&fields=total,items(track(id,name,artists,album,duration_ms))`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    );

    if (tracksRes.status === 429) {
      // The standard API heavily rate-limits anonymous embed tokens.
      // Retrying takes ~40s per page, making the parsing hang "forever".
      // We immediately fall back to the Partner API which works instantly.
      console.log(`  ⚠ Rate limited (offset=${offset}) — immediately falling back to Partner API.`);
      _tokenCache = null;
      return null;
    }

    if (!tracksRes.ok) {
      console.log(`  ⚠ Tracks API returned ${tracksRes.status} at offset ${offset} — stopping pagination`);
      return null;
    }

    const data = await tracksRes.json();
    if (data.error) {
      console.log(`  ⚠ Tracks API error at offset ${offset}: ${data.error.message}`);
      // If 403 forbidden, no point retrying
      if (data.error.status === 403) return null;
      _tokenCache = null;
      await sleep(2000);
      continue;
    }

    return data;
  }

  console.log(`  ❌ Giving up on offset ${offset} after ${maxRetries} attempts`);
  return null;
};

const fetchTracksPageViaPartner = async (playlistId, offset, maxRetries = 4) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const token = await getFreshToken(playlistId);
    const body = {
      operationName: 'fetchPlaylist',
      variables: {
        uri: `spotify:playlist:${playlistId}`,
        offset,
        limit: 100,
        enableWatchFeedEntrypoint: false,
      },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: PARTNER_FETCH_PLAYLIST_HASH,
        },
      },
    };

    const res = await fetch('https://api-partner.spotify.com/pathfinder/v1/query', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      _tokenCache = null;
      const retryAfter = Math.min(parseInt(res.headers.get('retry-after') || '3', 10), 10);
      console.log(`  🔁 Partner API rate limited (offset=${offset}) — retrying in ${retryAfter}s... (attempt ${attempt + 1}/${maxRetries})`);
      await sleep(retryAfter * 1000 + 500);
      continue;
    }

    if (!res.ok) {
      console.log(`  ⚠ Partner API returned ${res.status} at offset ${offset}`);
      return null;
    }

    const payload = await res.json();
    if (payload.errors?.length) {
      console.log(`  ⚠ Partner API error at offset ${offset}: ${payload.errors[0]?.message || 'unknown error'}`);
      _tokenCache = null;
      await sleep(2000);
      continue;
    }

    const content = payload?.data?.playlistV2?.content;
    const items = content?.items || [];
    const tracks = [];

    for (const item of items) {
      const t = item?.itemV2?.data;
      if (!t?.uri) continue;
      const spotifyId = t.uri.split(':').pop();
      if (!spotifyId) continue;

      const artists = t.artists?.items || [];
      tracks.push({
        spotifyId,
        title: t.name || 'Unknown Title',
        artist: artists.map((a) => a?.profile?.name).filter(Boolean).join(', ') || 'Unknown Artist',
        album: t.albumOfTrack?.name || '',
        albumArt: t.albumOfTrack?.coverArt?.sources?.[0]?.url || '',
        durationMs: t.trackDuration?.totalMilliseconds || 0,
      });
    }

    return {
      total: content?.totalCount ?? null,
      tracks,
    };
  }

  console.log(`  ❌ Partner API failed at offset ${offset} after ${maxRetries} attempts`);
  return null;
};

/**
 * Fetch ALL tracks from a public Spotify playlist using the embed page token.
 *
 * Strategy:
 *  - Page 1 (tracks 0-99): parsed from embed HTML (free, no API call)
 *  - Total count: fetched from API using embed token  
 *  - Page 2+ (tracks 100+): fetched via API with a FRESH token per page
 *    (token is refreshed every ~55s to avoid rate-limiting on long playlists)
 */
export const fetchPlaylistViaEmbed = async (playlistId) => {
  // Reset token cache so we always start fresh
  _tokenCache = null;

  // Step 1: Scrape the embed page — gets token + first 100 tracks
  const { token, initialTracks, playlistMeta } = await getEmbedData(playlistId);
  console.log(`  📄 Embed HTML: scraped ${initialTracks.length} tracks`);

  // Step 2: Use the embed token to fetch playlist metadata
  let total = initialTracks.length;
  let playlistName = playlistMeta.name;
  let coverArt = playlistMeta.coverArt;
  let owner = 'Spotify User';

  try {
    await sleep(1000);
    const metaRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}?fields=name,description,owner,images,tracks.total`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    );

    if (metaRes.status === 429) {
      console.log(`  🔁 Metadata rate limited — assuming more tracks if page was full.`);
      if (initialTracks.length >= 100) total = 9999; // force pagination
    } else if (metaRes.ok) {
      const meta = await metaRes.json();
      if (!meta.error) {
        total = meta.tracks?.total ?? total;
        playlistName = meta.name || playlistName;
        coverArt = meta.images?.[0]?.url || coverArt;
        owner = meta.owner?.display_name || owner;
        console.log(`  📊 Metadata: total=${total}, name="${playlistName}"`);
      }
    } else {
      console.log(`  ⚠ Metadata returned ${metaRes.status} — using embed HTML data`);
      if (initialTracks.length >= 100) total = 9999;
    }
  } catch (err) {
    console.log(`  ⚠ Metadata error: ${err.message}`);
    if (initialTracks.length >= 100) total = 9999;
  }

  // Step 3: Return early if playlist fits in first page
  if (total <= initialTracks.length) {
    return { playlistName, coverArt, owner, tracks: initialTracks };
  }

  // Step 4: Paginate the remaining tracks — fetch a fresh token each page
  const allTracks = [...initialTracks];
  let offset = 100;

  while (offset < total) {
    // Small delay between pages to be polite
    await sleep(1500);
    console.log(`  ⏳ Fetching tracks ${offset + 1}–${Math.min(offset + 100, total)} of ${total}...`);

    // Invalidate cached token so next getFreshToken() fetches a new embed page
    // This ensures each "page" gets its own fresh anonymous token, preventing
    // the token from accumulating rate-limit hits over a long playlist fetch.
    _tokenCache = null;

    const tracksData = await fetchTracksPage(playlistId, offset);
    if (tracksData && tracksData.items?.length) {
      if (tracksData.total && tracksData.total !== total && total === 9999) {
        total = tracksData.total;
        console.log(`  📊 Updated total from tracks response: ${total}`);
      }

      for (const item of tracksData.items) {
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
    } else {
      // For playlists blocked on /v1/playlists/:id/tracks, use partner GraphQL pagination.
      const partnerData = await fetchTracksPageViaPartner(playlistId, offset);
      if (!partnerData || !partnerData.tracks.length) {
        console.log(`  🏁 End of playlist reached at offset ${offset}.`);
        break;
      }
      if (partnerData.total && partnerData.total !== total && total === 9999) {
        total = partnerData.total;
        console.log(`  📊 Updated total from partner response: ${total}`);
      }
      allTracks.push(...partnerData.tracks);
    }

    offset += 100;
    console.log(`  📦 Embed: fetched ${allTracks.length} / ${total} tracks`);
  }

  console.log(`  ✅ Total tracks loaded: ${allTracks.length}`);
  return { playlistName, coverArt, owner, tracks: allTracks };
};
