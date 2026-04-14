import mongoose from 'mongoose';
import Playlist from './src/models/Playlist.model.js';

async function clear() {
  await mongoose.connect(process.env.MONGO_URI);
  await Playlist.deleteMany({ spotifyId: '7FOCgikpjJLYPQfmMhY35c' });
  console.log('Cleaned db cache');
  process.exit(0);
}
clear();
