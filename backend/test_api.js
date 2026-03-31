import fetch from 'isomorphic-unfetch';

const res = await fetch('http://localhost:5000/api/parse-playlist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://open.spotify.com/playlist/6TVBfAyDMbEWG88uR7h6QA?si=7e4e188f6e0a4709' }),
});

const data = await res.json();
if (data.error) {
  console.error('Error:', data.error);
} else {
  console.log('✅ Playlist parsed!');
  console.log('Name:', data.name);
  console.log('Tracks:', data.tracks?.length);
  console.log('PlaylistId:', data.playlistId);
  console.log('First track:', JSON.stringify(data.tracks?.[0], null, 2));
}
