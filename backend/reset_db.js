import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const Playlist = mongoose.model('Playlist', new mongoose.Schema({}, { strict: false }));
const Track = mongoose.model('Track', new mongoose.Schema({}, { strict: false }));

const deleted = await Playlist.deleteMany({});
const deletedTracks = await Track.deleteMany({});
console.log(`Deleted ${deleted.deletedCount} playlists and ${deletedTracks.deletedCount} tracks`);
await mongoose.disconnect();
