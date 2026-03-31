import express from 'express';
import {
  startDownload,
  getJobStatus,
  getLibrary,
  streamTrack,
} from '../controllers/download.controller.js';

const router = express.Router();

router.post('/download', startDownload);
router.get('/status/:trackId', getJobStatus);
router.get('/library', getLibrary);
router.get('/stream/:trackId', streamTrack);

export default router;
