import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const Track = (await import('./src/models/Track.model.js')).default;
  const Playlist = (await import('./src/models/Playlist.model.js')).default;
  
  // Clean up any stale partial downloads or errors from my tests
  await Track.updateMany({ status: 'done', filePath: '' }, { status: 'pending' });
  
  const tracks = await Track.find({ status: 'done' });
  console.log(`There are exactly ${tracks.length} downloaded files available to export.`);
  
  process.exit();
})();
