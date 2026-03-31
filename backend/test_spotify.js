import fetch from 'isomorphic-unfetch';
import spotifyUrlInfo from 'spotify-url-info';

const { getTracks } = spotifyUrlInfo(fetch);

const url = 'https://open.spotify.com/playlist/6TVBfAyDMbEWG88uR7h6QA?si=7e4e188f6e0a4709';

getTracks(url).then(data => {
  console.log("Success! Found tracks:", data.length);
}).catch(console.error);
