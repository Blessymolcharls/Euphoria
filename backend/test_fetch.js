import { fetchSpotifyPlaylist } from './src/services/spotify.service.js';

(async () => {
  try {
    const data = await fetchSpotifyPlaylist('6TVBfAyDMbEWG88uR7h6QA');
    console.log(`Success! Fetched totalTracks=${data.totalTracks}, tracks array length=${data.tracks.length}`);
  } catch (e) {
    console.error("Error during fetchSpotifyPlaylist:", e.message);
  }
})();
