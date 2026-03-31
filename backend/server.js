import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';
import playlistRoutes from './src/routes/playlist.routes.js';
import downloadRoutes from './src/routes/download.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

// Serve downloaded audio files statically
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Routes
app.use('/api', playlistRoutes);
app.use('/api', downloadRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Euphoria' }));

// Start server first (so Render detects the port), then connect to DB
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎵 Euphoria backend running on port ${PORT}`);
  connectDB().catch((err) => console.error('MongoDB connection error:', err.message));
});
