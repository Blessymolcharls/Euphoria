import fetch from 'isomorphic-unfetch';
import spotifyUrlInfo from 'spotify-url-info';

const spotify = spotifyUrlInfo(fetch);

async function test() {
  try {
    const tracks = await spotify.getTracks('https://open.spotify.com/playlist/7FOCgikpjJLYPQfmMhY35c');
    console.log('Got tracks:', tracks.length);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
