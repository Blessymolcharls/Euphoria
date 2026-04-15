import fetch from 'isomorphic-unfetch';
import Playlist from '../models/Playlist.model.js';
import Track from '../models/Track.model.js';
import {
  fetchSpotifyPlaylist,
  extractPlaylistId,
  fetchSpotifyPlaylistTrackCount,
} from '../services/spotify.service.js';

/**
 * POST /api/parse-playlist
 * Body: { url: "https://open.spotify.com/playlist/..." }
 */
export const parsePlaylist = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Playlist URL is required' });

    const spotifyId = extractPlaylistId(url);

    // Check if already cached in DB
    let playlist = await Playlist.findOne({ spotifyId }).populate('tracks');
    if (playlist && playlist.tracks.length > 0) {
      // Validate cached size so old 100-track caches are auto-refreshed.
      const spotifyTrackCount = await fetchSpotifyPlaylistTrackCount(spotifyId);
      const cachedTrackCount = playlist.tracks.length;

      // When Spotify returns null (403 in client credentials mode), keep cache.
      if (spotifyTrackCount === null || cachedTrackCount >= spotifyTrackCount) {
        return res.json({
          message: 'Playlist already parsed',
          playlistId: playlist._id,
          name: playlist.name,
          coverArt: playlist.coverArt,
          owner: playlist.owner,
          totalTracks: playlist.totalTracks,
          tracks: playlist.tracks,
        });
      }

      // Cached playlist is incomplete, so rebuild it.
      await Track.deleteMany({ playlistId: playlist._id });
      await Playlist.findByIdAndDelete(playlist._id);
      playlist = null;
    }

    // If a broken/empty playlist exists in DB, delete it so we can re-fetch cleanly
    if (playlist && playlist.tracks.length === 0) {
      await Track.deleteMany({ playlistId: playlist._id });
      await Playlist.findByIdAndDelete(playlist._id);
      playlist = null;
    }

    // Fetch from Spotify
    const data = await fetchSpotifyPlaylist(spotifyId);

    // Save playlist
    playlist = new Playlist({
      spotifyId: data.spotifyId,
      name: data.name,
      description: data.description,
      owner: data.owner,
      coverArt: data.coverArt,
      totalTracks: data.totalTracks,
    });
    await playlist.save();

    // Save tracks in bulk (insertMany is far more efficient than one-by-one create)
    const trackPayloads = data.tracks.map((t) => ({
      playlistId: playlist._id,
      spotifyId: t.spotifyId,
      title: t.title,
      artist: t.artist,
      album: t.album,
      albumArt: t.albumArt,
      durationMs: t.durationMs,
    }));

    const inserted = await Track.insertMany(trackPayloads, { ordered: false });

    playlist.tracks = inserted.map((t) => t._id);
    await playlist.save();

    res.json({
      playlistId: playlist._id,
      name: playlist.name,
      coverArt: playlist.coverArt,
      owner: playlist.owner,
      description: playlist.description,
      totalTracks: playlist.totalTracks,
      tracks: inserted,
    });
  } catch (err) {
    console.error('parsePlaylist error:', err.message);
    // Use 400 for user-facing Spotify errors, 500 for internal issues
    const status = err.message.includes('private') || err.message.includes('denied') || err.message.includes('not found') ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
};

/**
 * GET /api/tracks/:playlistId
 */
export const getTracks = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId).populate('tracks');
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    res.json({ playlist, tracks: playlist.tracks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
