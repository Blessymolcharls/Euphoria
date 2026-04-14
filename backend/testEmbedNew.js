import { fetchPlaylistViaEmbed } from './src/services/spotifyEmbed.service.js';

async function testFetch() {
  console.log('Testing embed scraper on 199 track playlist...');
  const res = await fetchPlaylistViaEmbed('7FOCgikpjJLYPQfmMhY35c');
  console.log('Final metadata:');
  console.log(`  Name: ${res.playlistName}`);
  console.log(`  Total tracks fetched: ${res.tracks.length}`);
}

testFetch();
