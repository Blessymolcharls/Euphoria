import mongoose from 'mongoose';
import Playlist from './src/models/Playlist.model.js';
import 'dotenv/config';

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const p = await Playlist.find().sort({ _id: -1 }).limit(1).populate('tracks');
  console.log('Most recent playlist ID:', p[0]._id);
  console.log('Spotify ID:', p[0].spotifyId);
  console.log('Total tracks saved:', p[0].tracks.length);
  if (p[0].tracks.length > 0) {
      console.log('Track 1 name:', p[0].tracks[0].title);
      console.log('Track 1 artwork:', p[0].tracks[0].albumArt);
  }
  process.exit(0);
}
check();
