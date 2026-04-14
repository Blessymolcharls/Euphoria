import fetch from 'isomorphic-unfetch';

(async () => {
  const res = await fetch('http://localhost:5000/api/parse-playlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM3M' })
  });

  const body = await res.json();
  console.log('Result body:', JSON.stringify(body, null, 2));
  process.exit(0);
})();
