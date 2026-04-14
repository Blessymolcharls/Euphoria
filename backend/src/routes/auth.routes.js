import express from 'express';
import {
  spotifyLogin,
  spotifyCallback,
  spotifyStatus,
  spotifyLogout,
} from '../controllers/spotifyAuth.controller.js';

const router = express.Router();

router.get('/spotify/login', spotifyLogin);
router.get('/spotify/callback', spotifyCallback);
router.get('/spotify/status', spotifyStatus);
router.post('/spotify/logout', spotifyLogout);

export default router;
