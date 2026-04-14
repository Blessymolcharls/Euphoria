import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import Playlist from '../models/Playlist.model.js';
import Track from '../models/Track.model.js';

export const exportPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Get all completed tracks for this playlist
    const tracks = await Track.find({ 
      playlistId, 
      status: 'done',
      filePath: { $exists: true, $ne: '' }
    });

    if (tracks.length === 0) {
      return res.status(400).json({ error: 'No downloaded tracks available to export.' });
    }

    // Set headers safely using Express attachment which handles unicode characters
    res.attachment(`${playlist.name}.zip`);

    // Create archiver
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      // Can't send JSON if we already sent headers
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    });

    // Pipe archive data to the response
    archive.pipe(res);

    // Append files
    for (const track of tracks) {
      if (fs.existsSync(track.filePath)) {
        archive.file(track.filePath, { name: track.fileName || path.basename(track.filePath) });
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error('Export error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};

/**
 * DELETE /api/export/:playlistId/cache
 * Deletes the physical MP3 files from the server's download directory to save space.
 */
export const clearCache = async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    // Find all tracks for this playlist that have a file
    const tracks = await Track.find({ playlistId, filePath: { $exists: true, $ne: '' } });
    
    let deletedCount = 0;
    
    for (const track of tracks) {
      if (fs.existsSync(track.filePath)) {
        fs.unlinkSync(track.filePath);
        deletedCount++;
      }
      // Also reset the track status if you want, but since they're exporting, it's fine 
      // just to leave status='done' and remove the filePath so stream stops working.
      track.filePath = '';
      await track.save();
    }
    
    res.json({ message: 'Server cache successfully cleared', deletedCount });
  } catch (err) {
    console.error('Cache clear error:', err);
    res.status(500).json({ error: err.message });
  }
};
