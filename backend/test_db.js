import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Playlist = (await import('./src/models/Playlist.model.js')).default;
  const p = await Playlist.findOne().sort({ createdAt: -1 });
  if (p) {
    console.log(`Playlist: ${p.name}`);
    console.log(`Spotify ID: ${p.spotifyId}`);
    console.log(`Total tracks in DB obj: ${p.totalTracks}`);
    console.log(`Tracks array length: ${p.tracks.length}`);
  } else {
    console.log('No playlist found.');
  }
  process.exit(0);
});
