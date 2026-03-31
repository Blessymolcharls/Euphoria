import express from 'express';
import {
  parsePlaylist,
  getTracks,
} from '../controllers/playlist.controller.js';

const router = express.Router();

router.post('/parse-playlist', parsePlaylist);
router.get('/tracks/:playlistId', getTracks);

export default router;
