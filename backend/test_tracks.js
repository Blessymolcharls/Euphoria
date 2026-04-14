import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const Track = (await import('./src/models/Track.model.js')).default;
  const tracks = await Track.find();
  const res = tracks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});
  console.log("Track status counts:", res);
  
  const errors = await Track.find({ status: 'error' }).limit(5);
  if (errors.length) {
    console.log("Sample errors:");
    errors.forEach(e => console.log(`- ${e.title}: ${e.errorMessage}`));
  }
  process.exit(0);
})();
