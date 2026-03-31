import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema(
  {
    playlistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist', required: true },
    spotifyId: { type: String, required: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, default: '' },
    durationMs: { type: Number, default: 0 },
    albumArt: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    youtubeId: { type: String, default: '' },
    filePath: { type: String, default: '' },
    fileName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'searching', 'downloading', 'done', 'error'],
      default: 'pending',
    },
    errorMessage: { type: String, default: '' },
    jobId: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Track', trackSchema);
