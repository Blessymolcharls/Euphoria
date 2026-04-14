import fs from 'fs';
import path from 'path';
import Track from '../models/Track.model.js';
import Playlist from '../models/Playlist.model.js';
import downloadQueue from '../queue/queue.js';

/**
 * POST /api/download
 * Body: { playlistId, trackIds? }  — if no trackIds, downloads all pending tracks
 */
export const startDownload = async (req, res) => {
  try {
    const { playlistId, trackIds } = req.body;
    if (!playlistId) return res.status(400).json({ error: 'playlistId is required' });

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    // Find tracks to download — pending ones, plus errored ones for retry
    let tracks;
    if (trackIds?.length) {
      tracks = await Track.find({ playlistId, _id: { $in: trackIds } });
    } else {
      tracks = await Track.find({ playlistId, status: { $in: ['pending', 'error'] } });
    }

    // Reset errored tracks back to pending so the queue can process them
    const errorIds = tracks.filter((t) => t.status === 'error').map((t) => t._id);
    if (errorIds.length) {
      await Track.updateMany(
        { _id: { $in: errorIds } },
        { $set: { status: 'pending', errorMessage: '', youtubeUrl: '', youtubeId: '' } }
      );
    }
    if (!tracks.length) {
      return res.json({ message: 'No tracks to download', queued: 0 });
    }

    // Enqueue each track
    const jobs = await Promise.all(
      tracks.map((track) =>
        downloadQueue.add('download-track', {
          trackId: track._id.toString(),
          playlistName: playlist.name,
        })
      )
    );

    // Update playlist status
    await Playlist.findByIdAndUpdate(playlistId, { downloadStatus: 'in_progress' });

    res.json({ message: 'Download started', queued: jobs.length });
  } catch (err) {
    console.error('startDownload error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/status/:trackId
 * Returns current status of a track.
 */
export const getJobStatus = async (req, res) => {
  try {
    const track = await Track.findById(req.params.trackId).select(
      'title artist status youtubeUrl fileName errorMessage'
    );
    if (!track) return res.status(404).json({ error: 'Track not found' });
    res.json(track);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/library
 * Returns all downloaded tracks grouped by playlist, Strictly checked against the OS Music folder.
 */
export const getLibrary = async (req, res) => {
  try {
    const playlists = await Playlist.find().populate({
      path: 'tracks',
      match: { status: 'done' },
      select: 'title artist album albumArt durationMs fileName filePath status',
    });

    const result = playlists
      .filter((p) => p.tracks.length > 0)
      .map((p) => {
        // Physical OS file check override! Only map if it's strictly in the Music folder.
        const validTracks = p.tracks.filter(t => t.filePath && fs.existsSync(t.filePath));
        
        return {
          _id: p._id,
          name: p.name,
          coverArt: p.coverArt,
          trackCount: validTracks.length,
          tracks: validTracks.map((t) => ({
            ...t.toObject(),
            streamUrl: `/api/stream/${t._id}`,
          })),
        };
      })
      .filter((p) => p.trackCount > 0);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/stream/:trackId
 * Streams the MP3 file with range support for the audio player.
 */
export const streamTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.trackId).select('filePath status');
    if (!track || track.status !== 'done') {
      return res.status(404).json({ error: 'Track not available' });
    }

    const filePath = track.filePath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'audio/mpeg',
      });
      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/download-file/:trackId
 * Downloads the actual MP3 file through the browser.
 */
export const downloadFile = async (req, res) => {
  try {
    const track = await Track.findById(req.params.trackId).select('filePath status fileName');
    if (!track || track.status !== 'done') {
      return res.status(404).json({ error: 'Track not available' });
    }

    const filePath = track.filePath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.download(filePath, track.fileName || 'track.mp3');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
