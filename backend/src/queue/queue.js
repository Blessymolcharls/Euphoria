import Track from '../models/Track.model.js';
import Playlist from '../models/Playlist.model.js';
import { findBestYouTubeMatch } from '../services/youtube.service.js';
import { downloadAudio } from '../services/downloader.service.js';

/**
 * Simple in-process async download queue.
 * Processes downloads with concurrency of 3 — no Redis required.
 */
const MAX_CONCURRENCY = 3;
let activeJobs = 0;
const jobQueue = [];

const processNext = async () => {
  if (activeJobs >= MAX_CONCURRENCY || jobQueue.length === 0) return;

  const job = jobQueue.shift();
  activeJobs++;

  try {
    await runJob(job);
  } catch (err) {
    console.error('Queue job error:', err.message);
  } finally {
    activeJobs--;
    processNext(); // pick up the next job
  }
};

const runJob = async ({ trackId, playlistName }) => {
  const track = await Track.findById(trackId);
  if (!track) return;

  try {
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

  // Update playlist status
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
};

/**
 * Add a download job to the queue.
 */
const downloadQueue = {
  add: (name, data) => {
    jobQueue.push(data);
    processNext();
    return Promise.resolve({ id: `${data.trackId}-${Date.now()}` });
  },
};

export default downloadQueue;
