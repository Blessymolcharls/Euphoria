import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db.js';
import Track from '../models/Track.model.js';
import Playlist from '../models/Playlist.model.js';
import { findBestYouTubeMatch } from '../services/youtube.service.js';
import { downloadAudio } from '../services/downloader.service.js';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

await connectDB();

const worker = new Worker(
  'euphoria-downloads',
  async (job) => {
    const { trackId, playlistName } = job.data;

    const track = await Track.findById(trackId);
    if (!track) throw new Error(`Track ${trackId} not found`);

    // Step 1: Search YouTube
    await Track.findByIdAndUpdate(trackId, { status: 'searching' });
    const match = await findBestYouTubeMatch(track.title, track.artist, track.durationMs);

    if (!match) {
      await Track.findByIdAndUpdate(trackId, {
        status: 'error',
        errorMessage: 'No YouTube match found',
      });
      return;
    }

    await Track.findByIdAndUpdate(trackId, {
      youtubeUrl: match.youtubeUrl,
      youtubeId: match.videoId,
      status: 'downloading',
    });

    // Step 2: Download
    try {
      const { filePath, fileName } = await downloadAudio(
        match.youtubeUrl,
        playlistName,
        `${track.artist} - ${track.title}`
      );

      await Track.findByIdAndUpdate(trackId, {
        filePath,
        fileName,
        status: 'done',
      });
    } catch (err) {
      await Track.findByIdAndUpdate(trackId, {
        status: 'error',
        errorMessage: err.message,
      });
    }

    // Update playlist downloadStatus
    const playlist = await Playlist.findById(track.playlistId).populate('tracks');
    if (playlist) {
      const statuses = playlist.tracks.map((t) => t.status);
      const allDone = statuses.every((s) => s === 'done' || s === 'error');
      const anyDone = statuses.some((s) => s === 'done');
      let downloadStatus = 'in_progress';
      if (allDone && anyDone) downloadStatus = 'done';
      if (allDone && !anyDone) downloadStatus = 'partial';
      await Playlist.findByIdAndUpdate(playlist._id, { downloadStatus });
    }
  },
  { connection, concurrency: 3 }
);

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

console.log('🎵 Euphoria download worker running...');
