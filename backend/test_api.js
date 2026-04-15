import fetch from 'isomorphic-unfetch';

const res = await fetch('http://localhost:5000/api/parse-playlist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://open.spotify.com/playlist/6TVBfAyDMbEWG88uR7h6QA?si=7e4e188f6e0a4709' }),
});

  let data;
  try {
    data = await res.json();
  } catch (err) {
    console.error('Failed to parse JSON. Status:', res.status);
    console.error('Response Text:', await res.text());
    process.exit(1);
  }

  if (data.error) {
    console.error('Error:', data.error);
  } else {
    console.log('✅ Playlist parsed!');
    console.log('Name:', data.name);
    console.log('Tracks:', data.tracks?.length);
    console.log('PlaylistId:', data.playlistId);
  }
