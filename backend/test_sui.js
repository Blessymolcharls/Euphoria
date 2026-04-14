import fetch from 'isomorphic-unfetch';
import spotifyUrlInfo from 'spotify-url-info';
const spotify = spotifyUrlInfo(fetch);

async function test() {
  const data = await spotify.getPreview('https://open.spotify.com/playlist/6TVBfAyDMbEWG88uR7h6QA');
  console.log('Preview:', data.trackList?.length);
}
test();
