import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema(
  {
    spotifyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    owner: { type: String, default: '' },
    coverArt: { type: String, default: '' },
    totalTracks: { type: Number, default: 0 },
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
    downloadStatus: {
      type: String,
      enum: ['idle', 'in_progress', 'done', 'partial'],
      default: 'idle',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Playlist', playlistSchema);
