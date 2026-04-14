import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const Track = (await import('./src/models/Track.model.js')).default;
  const errors = await Track.find({ status: 'error' }).select('title artist errorMessage');
  if (errors.length > 0) {
    console.log(`Found ${errors.length} tracks with errors:`);
    errors.forEach(e => console.log(`- ${e.title} by ${e.artist}: ${e.errorMessage}`));
  } else {
    console.log('No tracks currently have an "error" status.');
  }
  process.exit();
})();
