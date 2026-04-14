import dotenv from 'dotenv';
dotenv.config();

import { fetchSpotifyPlaylist } from './src/services/spotify.service.js';

const url = '6TVBfAyDMbEWG88uR7h6QA';

fetchSpotifyPlaylist(url)
  .then(data => {
    console.log("Total Tracks claimed:", data.totalTracks);
    console.log("Actually Array Length:", data.tracks.length);
  })
  .catch(console.error);
