import Playlist from '../models/Playlist.model.js';
import Track from '../models/Track.model.js';
import { fetchSpotifyPlaylist, extractPlaylistId } from '../services/spotify.service.js';

/**
 * POST /api/parse-playlist
 * Body: { url: "https://open.spotify.com/playlist/..." }
 */
export const parsePlaylist = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Playlist URL is required' });

    const spotifyId = extractPlaylistId(url);

    // Check if already exists
    let playlist = await Playlist.findOne({ spotifyId }).populate('tracks');
    if (playlist) {
      return res.json({
        message: 'Playlist already parsed',
        playlistId: playlist._id,
        name: playlist.name,
        coverArt: playlist.coverArt,
        totalTracks: playlist.totalTracks,
        tracks: playlist.tracks,
      });
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

    // Save tracks
    const trackDocs = await Promise.all(
      data.tracks.map((t) =>
        Track.create({
          playlistId: playlist._id,
          spotifyId: t.spotifyId,
          title: t.title,
          artist: t.artist,
          album: t.album,
          albumArt: t.albumArt,
          durationMs: t.durationMs,
        })
      )
    );

    playlist.tracks = trackDocs.map((t) => t._id);
    await playlist.save();

    res.json({
      playlistId: playlist._id,
      name: playlist.name,
      coverArt: playlist.coverArt,
      owner: playlist.owner,
      description: playlist.description,
      totalTracks: playlist.totalTracks,
      tracks: trackDocs,
    });
  } catch (err) {
    console.error('parsePlaylist error:', err.message);
    res.status(500).json({ error: err.message });
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
