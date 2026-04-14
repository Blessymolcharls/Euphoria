/**
 * test_full_playlist.js
 * 
 * Tests that the embed service can fetch ALL tracks from a large (>100) Spotify playlist.
 * Run with: node test_full_playlist.js
 */
import 'dotenv/config';
import { fetchPlaylistViaEmbed } from './src/services/spotifyEmbed.service.js';

// A well-known large public playlist (Today's Top Hits — ~50 songs, safe for testing)
// Using "Beast Mode" playlist which has ~150 tracks
const TEST_PLAYLIST_ID = '38BH3tVShlJxZeqAOKHgkT'; // "Beast Mode" - ~150 tracks

console.log('🧪 Testing full playlist fetch (expect > 100 tracks)...');
console.log('⏳ This may take 30-60 seconds for large playlists due to polite rate limiting.\n');

const start = Date.now();

fetchPlaylistViaEmbed(TEST_PLAYLIST_ID)
  .then(({ playlistName, owner, tracks }) => {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log('\n──────────────────────────────────────');
    console.log(`✅ SUCCESS in ${elapsed}s`);
    console.log(`📋 Playlist: "${playlistName}" by ${owner}`);
    console.log(`🎵 Total tracks fetched: ${tracks.length}`);
    console.log(`📦 First track: "${tracks[0]?.title}" — ${tracks[0]?.artist}`);
    if (tracks.length > 100) {
      console.log(`🎉 Track 101: "${tracks[100]?.title}" — ${tracks[100]?.artist}`);
    }
    if (tracks.length > 100) {
      console.log('\n✅ PAGINATION WORKS — fetched more than 100 tracks!');
    } else {
      console.log('\n⚠️  Only 100 or fewer tracks returned. Playlist might be small, or pagination failed.');
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ FAILED:', err.message);
    process.exit(1);
  });
