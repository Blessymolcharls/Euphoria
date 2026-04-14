import express from 'express';
import {
  startDownload,
  getJobStatus,
  getLibrary,
  streamTrack,
  downloadFile,
} from '../controllers/download.controller.js';

import { exportPlaylist, clearCache } from '../controllers/export.controller.js';

const router = express.Router();

router.post('/download', startDownload);
router.get('/status/:trackId', getJobStatus);
router.get('/library', getLibrary);
router.get('/stream/:trackId', streamTrack);
router.get('/download-file/:trackId', downloadFile);
router.get('/export/:playlistId', exportPlaylist);
router.delete('/export/:playlistId/cache', clearCache);

export default router;
