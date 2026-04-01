import express from 'express';
import {
  parsePlaylist,
  getTracks,
} from '../controllers/playlist.controller.js';
import Playlist from '../models/Playlist.model.js';
import Track from '../models/Track.model.js';

const router = express.Router();

router.post('/parse-playlist', parsePlaylist);
router.get('/tracks/:playlistId', getTracks);

// Emergency route to clear cached playlists that have the 100 track limit
router.get('/clear', async (req, res) => {
  try {
    const d1 = await Playlist.deleteMany({});
    const d2 = await Track.deleteMany({});
    res.send(`<h1>Cache Cleared!</h1><p>Deleted ${d1.deletedCount} cached playlists and ${d2.deletedCount} cached tracks from Atlas.</p><p>You can now go back and parse your playlist to get all 675 tracks!</p>`);
  } catch (err) {
    res.status(500).send('Error clearing cache: ' + err.message);
  }
});

export default router;
