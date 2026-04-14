import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import ytDlpExec from 'yt-dlp-exec';
import ffmpegPath from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Download audio from a YouTube URL using bundled yt-dlp-exec + ffmpeg-static.
 * Saves as MP3 to: {User/Music}/Euphoria/{playlistSlug}/{safeTitle}.mp3
 */
export const downloadAudio = async (youtubeUrl, playlistName, trackTitle) => {
  const downloadsRoot = process.env.DOWNLOADS_DIR
    ? path.resolve(process.env.DOWNLOADS_DIR)
    : path.join(os.homedir(), 'Music', 'Euphoria');

  const playlistSlug = sanitize(playlistName);
  const trackSlug = sanitize(trackTitle);
  const outDir = path.join(downloadsRoot, playlistSlug);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outputTemplate = path.join(outDir, `${trackSlug}.%(ext)s`);
  const finalPath = path.join(outDir, `${trackSlug}.mp3`);

  // Use the bundled yt-dlp binary via yt-dlp-exec
  await ytDlpExec(youtubeUrl, {
    extractAudio: true,
    audioFormat: 'mp3',
    audioQuality: 0,
    ffmpegLocation: ffmpegPath, // bundled FFmpeg from ffmpeg-static
    output: outputTemplate,
    noPlaylist: true,
    quiet: true,
    noWarnings: true,
  });

  if (!fs.existsSync(finalPath)) {
    throw new Error(`Download failed: output file not found at ${finalPath}`);
  }

  return { filePath: finalPath, fileName: `${trackSlug}.mp3` };
};

/**
 * Sanitize a string to be safe for filesystem use.
 */
const sanitize = (str) =>
  str
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
