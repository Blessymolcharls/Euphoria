import dotenv from 'dotenv';
dotenv.config();

import { fetchPlaylistViaEmbed } from './src/services/spotifyEmbed.service.js';

const url = '6TVBfAyDMbEWG88uR7h6QA';

console.log("Testing embed directly...");
fetchPlaylistViaEmbed(url)
  .then(data => {
    console.log("SUCCESS! Total Tracks claimed:", data.tracks?.length);
  })
  .catch(console.error);
